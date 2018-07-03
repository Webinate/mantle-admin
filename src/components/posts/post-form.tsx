import * as React from 'react';
import * as moment from 'moment';
import { TextField, Button, IconButton, Chip, Switch, FormControlLabel } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { IPost, IUserEntry } from 'modepress';
import { default as styled } from '../../theme/styled';
import TinyPostEditor from './tiny-post-editor';
import theme from '../../theme/mui-theme';
import { SlugEditor } from '../slug-editor';
import { UserPicker } from '../user-picker';
import { CategoryEditor } from '../../containers/category-editor';

export type Props = {
  activeUser: IUserEntry<'client'>;
  isAdmin: boolean;
  id?: string;
  post?: Partial<IPost<'client'>> | null;
  onFetch?: ( id: string ) => void;
  onUpdate?: ( post: Partial<IPost<'client'>> ) => void;
  onCreate?: ( post: Partial<IPost<'client'>> ) => void;
}

export type State = {
  editable: Partial<IPost<'client'>>;
  currentTagText: string;
  slugWasEdited: boolean;
}

export class PostForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      editable: props.post ? { ...props.post } : this.createEmptyPost(),
      currentTagText: '',
      slugWasEdited: false
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

        <TinyPostEditor
          content={this.state.editable.content!}
          onContentChanged={content => {
            // Doing this in a mutable way becase we dont to overload the tiny editor
            this.state.editable.content = content;
          }}
        />
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

          <FormControlLabel
            control={
              <Switch
                className="mt-visibility-toggle"
                style={{ margin: '20px 0' }}
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
            label={this.state.editable.public ? 'Post is Public' : 'Post is Private'}
          />
          {this.props.post ?
            <Dates>
              <div>Created: </div>
              <div>
                {moment( this.props.post.createdOn ).format( 'MMM Do, YYYY' )}
              </div>
              <div>Updated: </div>
              <div>
                {moment( this.props.post.lastUpdated ).format( 'MMM Do, YYYY' )}
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
                style={{ padding: 0, width: 30, height: 30 }}><AddIcon style={{ width: 26, height: 26 }} />
              </IconButton>
            </div>
          </TagsInput>
          <TagWrapper>
            {this.state.editable.tags!.map( ( tag, tagIndex ) => {
              return <Chip
                key={`tag-${ tagIndex }`}
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
              >
                {tag}
              </Chip>;
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
      </div>
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
  max-width: 30px;
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