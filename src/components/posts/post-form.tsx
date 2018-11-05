import * as React from 'react';
import * as format from 'date-fns/format';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Delete';
import { IPost, IUserEntry, IFileEntry, ITemplate } from '../../../../../src';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import SlugEditor from '../slug-editor';
import UserPicker from '../user-picker';
import { CategoryEditor } from '../../containers/category-editor';
import FormControl from '@material-ui/core/FormControl';
import { MediaModal } from '../../containers/media-modal';
import Tooltip from '@material-ui/core/Tooltip';
import { DraftEditor } from '../../containers/draft-editor';

export type Props = {
  activeUser: IUserEntry<'client'>;
  isAdmin: boolean;
  id?: string;
  post?: Partial<IPost<'client'>> | null;
  templates: ITemplate<'client'>[];
  onFetch?: ( id: string ) => void;
  onUpdate?: ( post: Partial<IPost<'client'>> ) => void;
  onCreate?: ( post: Partial<IPost<'client'>> ) => void;
  renderAfterForm?: () => undefined | null | JSX.Element;
}

export type State = {
  editable: Partial<IPost<'client'>>;
  currentTagText: string;
  slugWasEdited: boolean;
  showMediaPopup: boolean;
}

export default class PostForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      editable: props.post ? { ...props.post } : this.createEmptyPost(),
      currentTagText: '',
      slugWasEdited: false,
      showMediaPopup: false
    };
  }

  componentDidMount() {
    if ( this.props.onFetch )
      this.props.onFetch( this.props.id! )
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.post !== this.props.post )
      this.setState( {
        editable: { ...next.post },
        currentTagText: ''
      } );
  }

  private createEmptyPost(): Partial<IPost<'client'>> {
    return {
      title: '',
      brief: '',
      categories: [],
      tags: [],
      content: '',
      public: false,
      slug: '',
      featuredImage: '',
      createdOn: Date.now(),
      lastUpdated: Date.now(),
      author: this.props.activeUser
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
        ...this.state.editable, tags: this.state.editable.tags!.concat( this.state.currentTagText.trim() )
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

  render() {
    return <Form>
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
                    editable: { ...this.state.editable, author: user ? user : '' }
                  } );
                }}
                user={this.state.editable.author ? this.state.editable.author as IUserEntry<'client'> : null}
              />
            </div>
          </SlugContainer>
        </div>
        <DraftEditor />
        {this.props.renderAfterForm ? this.props.renderAfterForm() : undefined}

      </div>
      <div>
        <RightPanel>
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
          >{this.props.post ? 'Update' : 'Publish'}</Button>

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
        </RightPanel>

        <RightPanel>
          <h3>Post Tags</h3>
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
        </RightPanel>

        <RightPanel>
          <h3>Post Meta</h3>
          <TextField
            id="mt-post-desc"
            value={this.state.editable.brief}
            fullWidth={true}
            multiline={true}
            helperText="Post Brief Description"
            onChange={( e ) => this.setState( { editable: { ...this.state.editable, brief: e.currentTarget.value } } )}
          />
        </RightPanel>

        <RightPanel style={{ position: 'relative' }}>
          {this.state.editable.featuredImage ? <IconButton
            id="mt-remove-featured"
            onClick={e => this.setState( { editable: { ...this.state.editable, featuredImage: '' } } )}
            style={{ position: 'absolute', top: '5px', right: '5px' }}>
            <RemoveIcon />
          </IconButton> : undefined}
          <h3>Featured Image</h3>
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
        </RightPanel>

        <RightPanel>
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
        </RightPanel>

        <RightPanel>
          <h3>Template</h3>
          <div>
            {this.props.templates.map( t => (
              <FormControlLabel
                key={t._id}
                label={t.name}
                control={<Checkbox
                  value={t._id}
                  checked={false}
                  color="primary"
                  className={`mt-template`}
                />}
              />
            ) )}
          </div>
        </RightPanel>
      </div>

      {this.state.showMediaPopup ?
        <MediaModal
          {...{} as any}
          open={true}
          onCancel={() => { this.setState( { showMediaPopup: false } ) }}
          onSelect={file => this.setState( {
            showMediaPopup: false,
            editable: { ...this.state.editable, featuredImage: file }
          } )}
        /> : undefined}
    </Form >;
  }
}

const Form = styled.form`
  padding: 10px;
  display: flex;

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
  }
`;

const FeaturedImg = styled.div`
  margin: 16px 0 0 0;
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

const RightPanel = styled.div`
  background: ${theme.light100.background };
  border: 1px solid ${theme.light100.border };
  padding: 20px;
  border-radius: 5px;
  overflow: hidden;
  margin: 0 0 10px 0;

  > h3 {
    margin: 0;
  }
`;