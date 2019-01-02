import * as React from 'react';
import * as format from 'date-fns/format';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Icon from '@material-ui/core/Icon';
import RemoveIcon from '@material-ui/icons/Delete';
import { IPost, IUserEntry, IFileEntry, IDraftElement, ITemplate, IDocument } from 'modepress';
import { State as TemplateState } from '../../store/templates/reducer';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import SlugEditor from '../slug-editor';
import UserPicker from '../user-picker';
import { CategoryEditor } from '../../containers/category-editor';
import FormControl from '@material-ui/core/FormControl';
import { MediaModal } from '../../containers/media-modal';
import Tooltip from '@material-ui/core/Tooltip';
import { ElmEditor } from './elm-editor';
import CircularProgress from '@material-ui/core/CircularProgress';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export type Props = {
  activeUser: IUserEntry<'client' | 'expanded'>;
  isAdmin: boolean;
  id?: string;
  post: Partial<IPost<'client' | 'expanded'>>;
  elements: IDraftElement<'client' | 'expanded'>[];
  templates: TemplateState;
  categoriesLoading: boolean;
  animated: boolean;
  selectedElements: string[];
  onUpdate?: ( post: Partial<IPost<'client' | 'expanded'>> ) => void;
  onCreate?: ( post: Partial<IPost<'client' | 'expanded'>> ) => void;
  renderAfterForm?: () => undefined | null | JSX.Element;
  onTemplateChanged: ( templateId: string ) => void;
  onCreateElm: ( elm: Partial<IDraftElement<'client' | 'expanded'>>, index?: number ) => void;
  onUpdateElm: ( id: string, html: string, createElement: Partial<IDraftElement<'client' | 'expanded'>> | null, deselect: 'select' | 'deselect' | 'none' ) => void;
  onDeleteElements: ( ids: string[] ) => void;
  onSelectionChanged: ( ids: string[] ) => void;
}

export type State = {
  editable: Partial<IPost<'client' | 'expanded'>>;
  currentTagText: string;
  slugWasEdited: boolean;
  showMediaPopup: boolean;
  activeTemplate: string;
}

export default class PostForm extends React.Component<Props, State> {
  private _editableRef: Partial<IPost<'client' | 'expanded'>>;

  constructor( props: Props ) {
    super( props );
    this._editableRef = { ...props.post };
    const doc = props.post.document as IDocument<'client'>;
    const template = doc.template as ITemplate<'client'>;
    this.state = {
      editable: this._editableRef,
      currentTagText: '',
      slugWasEdited: false,
      showMediaPopup: false,
      activeTemplate: template._id
    };
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.post !== this.props.post ) {
      this._editableRef = { ...next.post };
      const doc = next.post.document as IDocument<'client'>;
      const template = doc.template as ITemplate<'client'>;

      this.setState( {
        editable: this._editableRef,
        currentTagText: '',
        activeTemplate: template._id
      } );
    }
  }

  private addTag() {
    const text = this.state.currentTagText.trim();

    if ( this.state.editable.tags!.indexOf( text ) !== -1 )
      return;

    if ( text === '' )
      return;

    this.setState( {
      currentTagText: '',
      editable: {
        ...this.state.editable,
        tags: this.state.editable.tags!.concat( this.state.currentTagText.trim() )
      }
    } )
  }

  private getSlug( title: string ) {
    if ( this.state.slugWasEdited )
      return this.state.editable.slug;

    let toRet = title.toLowerCase().replace( /\s+/g, '-' );
    toRet = toRet.replace( /[^a-zA-Z0-9 -]/g, '' );
    return toRet;
  }

  private isPostValid() {
    if ( !this.state.editable.title || this.state.editable.title.trim() === '' )
      return false;
    if ( !this.state.editable.slug || this.state.editable.slug.trim() === '' )
      return false;

    return true;
  }

  private renderUpdateBox() {
    return <ExpansionPanel expanded={true} className="mt-update-panel">
      <ExpansionPanelDetails>
        <div className="mt-panel-inner">
          <Button
            variant="contained"
            className="mt-post-confirm"
            onClick={e => {
              if ( this.props.post && this.props.onUpdate )
                this.props.onUpdate( this.state.editable );
              else if ( this.props.onCreate )
                this.props.onCreate( this.state.editable );
            }}
            color="primary"
            fullWidth={true}
            disabled={!this.isPostValid()}
          >Update</Button>

          <FormControl className="mt-visibility-toggle">
            <FormControlLabel
              control={
                <Switch
                  color="primary"

                  checked={this.state.editable.public ? true : false}
                  onChange={e => {
                    this.setState( {
                      editable: {
                        ...this.state.editable,
                        public: this.state.editable.public ? false : true
                      }
                    } )
                  }}
                />
              }
              label={<span className="mt-visibility-toggle-label">{this.state.editable.public ? 'Post is public' : 'Post is private'}</span>}
            />
          </FormControl>
          {this.props.post ?
            <Dates>
              <div>Created: </div>
              <div>
                {format( new Date( this.props.post.createdOn! ), 'MMM Do, YYYY' )}
              </div>
              <div>Updated: </div>
              <div>
                {format( new Date( this.props.post.lastUpdated! ), 'MMM Do, YYYY' )}
              </div>
            </Dates> : undefined}
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  }

  private renderTags() {
    return <ExpansionPanel className="mt-tags-panel">
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
        <h3>Post Tags</h3>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className="mt-panel-inner">
          <TagsInput style={{ display: 'flex' }}>
            <div>
              <TextField
                id="mt-add-new-tag"
                helperText="Type a tag and hit enter"
                value={this.state.currentTagText}
                fullWidth={true}
                onKeyUp={e => {
                  if ( e.keyCode === 13 && this.state.currentTagText.trim() !== '' )
                    this.addTag();
                }}
                onChange={( e ) => this.setState( { currentTagText: e.currentTarget.value } )}
              />
            </div>
            <div>
              <IconButton
                id="mt-add-tag"
                onClick={e => this.addTag()}
                style={{ margin: '0 4px' }}>
                <AddIcon />
              </IconButton>
            </div>
          </TagsInput>
          <TagWrapper>
            {this.state.editable.tags!.map( ( tag, tagIndex ) => {
              return <Chip
                key={`tag-${ tagIndex }`}
                label={tag}
                className="mt-tag-chip"
                style={{ margin: '4px 4px 0 0' }}
                onDelete={e => {
                  this.setState( {
                    editable: {
                      ...this.state.editable,
                      tags: this.state.editable.tags!.filter( t => t !== tag )
                    }
                  } )
                }}
              />;
            } )}
          </TagWrapper>
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  }

  private renderMeta() {
    return <ExpansionPanel className="mt-meta-panel">
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
        <h3>Post Meta Data</h3>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className="mt-panel-inner">
          <TextField
            id="mt-post-desc"
            value={this.state.editable.brief}
            fullWidth={true}
            multiline={true}
            helperText="Post Brief Description"
            onChange={( e ) => this.setState( { editable: { ...this.state.editable, brief: e.currentTarget.value } } )}
          />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  }

  private renderFeaturedImg() {
    return <ExpansionPanel className="mt-featured-panel">
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
        <h3>Featured Image</h3>
        {this.state.editable.featuredImage ? <Icon
          id="mt-remove-featured"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.setState( { editable: { ...this.state.editable, featuredImage: '' } } );
          }}
          style={{
            margin: '5px 0px 0px 18px',
            position: 'absolute',
            right: '40px'
          }}>
          <RemoveIcon style={{ fontSize: '18px', color: theme.primary200.background }} />
        </Icon> : undefined}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div style={{ position: 'relative', flex: '1' }}>
          <FeaturedImg
            id="mt-featured-img"
            onClick={e => this.setState( { showMediaPopup: true } )}
          >
            <Tooltip title="Click to upload image">
              {this.state.editable.featuredImage ?
                <img src={( this.state.editable.featuredImage as IFileEntry<'client'> ).publicURL} /> :
                <img src={'/images/post-feature.svg'} />
              }
            </Tooltip>
          </FeaturedImg>
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  }

  private renderCategories() {
    return <ExpansionPanel className="mt-categories-panel">
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
        <h3>Categories</h3>
        {this.props.categoriesLoading ? <span
          style={{ margin: '4px 0 0 15px' }}
          className="mt-cat-loading"
        >
          <CircularProgress size={20} />
        </span> : undefined}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className="mt-panel-inner">
          <CategoryEditor
            onCategorySelected={category => {
              let newIds: string[] = [];
              const index = this.state.editable.categories!.indexOf( category._id );

              if ( index === -1 )
                newIds = this.state.editable.categories!.concat( category._id );
              else
                newIds = this.state.editable.categories!.filter( f => f !== category._id );

              this.setState( { editable: { ...this.state.editable, categories: newIds } } )
            }}
            {...{
              selected: this.state.editable.categories || [],

            } as any}
          />
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  }

  private hasModified() {
    if ( this.state.editable !== this._editableRef )
      return true;
    else
      return false;
  }

  private renderTemplates() {
    const templates = this.props.templates;
    const templateId = this.state.activeTemplate;
    const doc = this.state.editable.document as IDocument<'client'>;
    const curTemplate = doc.template as ITemplate<'client'>;

    return <ExpansionPanel className="mt-templates-panel">
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon className="mt-panel-expand" />}>
        <h3>Templates</h3>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className="mt-panel-inner">
          {templates.busy || !templates.templatesPage ?
            <CircularProgress
              className="mt-loading mt-loading-templates"
              size={30}
              style={{ margin: '10px auto' }}
            /> : (
              <List>
                {templates.templatesPage.data.map( t => (
                  <ListItem
                    key={t._id}
                    className="mt-template-item"
                  >
                    <ListItemText className="mt-template-item-name" primary={t.name} />
                    <ListItemSecondaryAction>
                      <Switch
                        color="primary"
                        className="mt-template-item-switch"
                        onChange={e => this.setState( { activeTemplate: t._id } )}
                        checked={templateId === t._id}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ) )}
              </List>
            )
          }

          <Button
            color="primary"
            variant="contained"
            id="mt-apply-template"
            fullWidth={true}
            disabled={this.state.activeTemplate === curTemplate._id}
            onClick={e => this.props.onTemplateChanged( this.state.activeTemplate )}
          >
            Apply Template
          </Button>

          {this.hasModified() ? <div style={{
            textAlign: 'center',
            color: theme.error.background,
            margin: '20px 0 0 0'
          }}
            id="mt-template-changes-warning"
          >
            Note: You have unsaved changes, these will be overritten if you apply a new template
          </div> : undefined}

        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  }

  render() {
    const doc = this.state.editable.document as IDocument<'client'>;

    return <Form
      animated={this.props.animated}
    >
      <div>
        <div>
          <input
            id="mt-post-title"
            value={this.state.editable.title}
            placeholder="Enter Post Title"
            onChange={( e ) => {
              this.setState( {
                editable: {
                  ...this.state.editable,
                  title: e.currentTarget.value,
                  slug: this.getSlug( e.currentTarget.value )
                }
              } )
            }}
          />
          <SlugContainer>
            <div>
              <SlugEditor
                value={this.state.editable.slug}
                onChange={( value ) => {
                  this.setState( {
                    slugWasEdited: true,
                    editable: { ...this.state.editable, slug: value }
                  } );
                }}
              />
            </div>
            <div>
              <i>Author: </i>
              <UserPicker
                canEdit={this.props.isAdmin}
                onChange={user => {
                  this.setState( {
                    editable: { ...this.state.editable, author: user ? user : '' } as IPost<'client'>
                  } );
                }}
                user={this.state.editable.author ? this.state.editable.author as IUserEntry<'client'> : null}
              />
            </div>
          </SlugContainer>
        </div>
        <ElmEditor
          elements={this.props.elements}
          document={doc}
          onCreateElm={( elm, index ) => this.props.onCreateElm( elm, index )}
          onUpdateElm={( id, html, createParagraph, deselect ) => this.props.onUpdateElm( id, html, createParagraph, deselect )}
          onDeleteElm={ids => this.props.onDeleteElements( ids )}
          onSelectionChanged={uids => this.props.onSelectionChanged( uids )}
          selected={this.props.selectedElements}
        />
        {this.props.renderAfterForm ? this.props.renderAfterForm() : undefined}

      </div>
      <div>
        {this.renderUpdateBox()}
        {this.renderTags()}
        {this.renderMeta()}
        {this.renderFeaturedImg()}
        {this.renderCategories()}
        {this.renderTemplates()}
      </div>

      {this.state.showMediaPopup ?
        <MediaModal
          {...{} as any}
          open={true}
          onCancel={() => { this.setState( { showMediaPopup: false } ) }}
          onSelect={file => this.setState( {
            showMediaPopup: false,
            editable: { ...this.state.editable, featuredImage: file } as IPost<'expanded'>
          } )}
        /> : undefined}
    </Form>;
  }
}

interface FormStyleProps extends React.HTMLAttributes<HTMLElement> {
  animated: boolean;
}

const Form = styled.form`
  padding: 10px;
  display: flex;

  h3 {
    margin: 5px 0;
  }

  ${ ( props: FormStyleProps ) => !props.animated ? '* { transition: none !important; }' : '' }

  .mt-panel-inner {
    width: 100%;
  }

  #mt-post-title {
    display: block;
    width: 100%;
    padding: 10px;
    border: 1px solid ${theme.light100.border };
    border-radius: 4px;
    box-sizing: border-box;
    transition: 0.5s border;
    font-size: 20px;
    font-weight: lighter;

    &::placeholder {
      color: ${theme.light100.softColor };
    }
    &:active, &:focus {
      border: 1px solid ${theme.primary100.border };
      outline: none;
    }
  }

  > div:nth-child(1) {
    flex: 2;
  }

  > div:nth-child(2) {
    flex: 1;
    margin: 0 0 0 20px;
    max-width: 350px;
  }
`;

const FeaturedImg = styled.div`
  text-align: center;
  cursor: pointer;
  img {
    max-height: 100%;
    max-width: 100%;
  }
`;

const SlugContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 2px 0 8px 0;

  > div:nth-child(1) {
    flex: 1;
  }

  > div:nth-child(2) {
    flex: 0 1 auto;
  }

  > div > i {
    vertical-align: middle;
    color: ${theme.light200.softColor };
  }
`;

const TagWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Dates = styled.div`
display: flex;
flex-wrap: wrap;

> div {
  flex: 50%;
  &:nth-child(2n+1) {
    font-style: italic;
  }
  &:nth-child(2n+0) {
    text-align: right;
  }
}
`;

const TagsInput = styled.div`
display: flex;
align-items: center;
> div:nth-child(1) {
  flex: 1;
}
> div:nth-child(2) {
  flex: 1;
  max-width: 50px;
}
`;