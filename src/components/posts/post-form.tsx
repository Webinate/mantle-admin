import * as React from 'react';
import { TextField, Toggle, RaisedButton, IconButton } from 'material-ui';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import AddIcon from 'material-ui/svg-icons/content/add';
import { IPost } from 'modepress';
import { default as styled } from '../../theme/styled';
import TinyPostEditor from './tiny-post-editor';
import theme from '../../theme/mui-theme';

export type Props = {
  id?: string;
  post?: Partial<IPost> | null;
  onFetch?: ( id: string ) => void;
  onUpdate?: ( post: Partial<IPost> ) => void;
  onCreate?: ( post: Partial<IPost> ) => void;
}

export type State = {
  editable: Partial<IPost>;
  currentTagText: string;
}

export class PostForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      editable: props.post ? { ...props.post } : this.createEmptyPost(),
      currentTagText: ''
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

  private createEmptyPost(): IPost {
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
      lastUpdated: Date.now()
    }
  }

  render() {
    return <Form>
      <div>
        <TextField
          value={this.state.editable.title}
          floatingLabelText="Post Title"
          onChange={( e, value ) => this.setState( { editable: { ...this.state.editable, title: value } } )}
        />
        <br />
        <TextField
          value={this.state.editable.slug}
          floatingLabelText="Slug"
          onChange={( e, value ) => this.setState( { editable: { ...this.state.editable, slug: value } } )}
        />
        <br />
        <TextField
          value={this.state.editable.brief}
          floatingLabelText="Post Brief Description"
          onChange={( e, value ) => this.setState( { editable: { ...this.state.editable, brief: value } } )}
        />
        <br />
        <h3>Content</h3>
        <TinyPostEditor
          content={this.state.editable.content!}
          onContentChanged={content => {
            // Doing this in a mutable way becase we dont to overload the tiny editor
            this.state.editable.content = content;
          }}
        />
      </div>
      <div>
        <PublishPanel>
          <RaisedButton
            onClick={e => {
              if ( this.props.post && this.props.onUpdate )
                this.props.onUpdate( this.state.editable );
              else if ( this.props.onCreate )
                this.props.onCreate( this.state.editable );
            }}
            primary={true}
            fullWidth={true}
            label={this.props.post ? 'Update' : 'Publish'}
          />
          <Toggle
            style={{ margin: '20px 0' }}
            name="mt-post-visibility"
            label={this.state.editable.public ? 'Post is Public' : 'Post is Private'}
            labelPosition="right"
            toggled={this.state.editable.public ? true : false}
            onClick={e => {
              this.setState( { editable: { ...this.state.editable, public: this.state.editable.public ? false : true } } )
            }}
          />
        </PublishPanel>

        <PublishPanel>
          <h3>Tags</h3>
          <TagsInput style={{ display: 'flex' }}>
            <div>
              <TextField
                floatingLabelText="Type a tag and hit enter"
                value={this.state.currentTagText}
                fullWidth={true}
                onKeyUp={e => {
                  if ( e.keyCode === 13 && this.state.currentTagText.trim() !== '' && this.state.editable.tags!.indexOf( this.state.currentTagText.trim() ) === -1 )
                    this.setState( {
                      currentTagText: '',
                      editable: {
                        ...this.state.editable, tags: this.state.editable.tags!.concat( this.state.currentTagText.trim() )
                      }
                    } )
                }}
                onChange={( e, val ) => this.setState( { currentTagText: val } )}
              />
            </div>
            <div>
              <IconButton
                iconStyle={{ width: 26, height: 26 }}
                style={{ padding: 0, width: 30, height: 30 }}><AddIcon />
              </IconButton>
            </div>
          </TagsInput>
          <div>
            {this.state.editable.tags!.map( ( tag, tagIndex ) => {
              return <Tag key={`tag-${ tagIndex }`}>{tag} <IconButton
                iconStyle={{
                  width: 16,
                  height: 16
                }}
                style={{
                  padding: 0,
                  width: 26,
                  height: 26
                }}><CancelIcon onClick={e => {
                  this.setState( { editable: { ...this.state.editable, tags: this.state.editable.tags!.filter( t => t !== tag ) } } )
                }} /></IconButton></Tag>
            } )}
          </div>
        </PublishPanel>
      </div>
    </Form>;
  }
}

const Form = styled.form`
  padding: 10px;
  display: flex;

  > div:nth-child(1) {
    flex: 2;
  }

  > div:nth-child(2) {
    flex: 1;
    margin: 0 0 0 20px;
  }
`;

const TagsInput = styled.div`
display: flex;
> div:nth-child(1) {
  flex: 1;
}
> div:nth-child(2) {
  flex: 1;
  max-width: 30px;
}
`;

const PublishPanel = styled.div`
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

const Tag = styled.div`
  background: ${theme.primary100.background };
  color: ${theme.primary100.color };
  border: 1px solid ${theme.primary100.border };
  padding: 4px;
  border-radius: 5px;
  display: inline-block;
  margin: 0 5px 5px 0;

  > button {
    vertical-align: middle;
  }
`;