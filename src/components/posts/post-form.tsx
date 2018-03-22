import * as React from 'react';
import { TextField, Toggle, RaisedButton, CircularProgress } from 'material-ui';
import { IPost } from 'modepress';
import { default as styled } from '../../theme/styled';
import TinyPostEditor from './tiny-post-editor';
import theme from '../../theme/mui-theme';

export type Props = {
  id?: string;
  loading: boolean;
  post?: Partial<IPost> | null;
  onFetch?: ( id: string ) => void;
  onUpdate?: ( post: Partial<IPost> ) => void;
  onCreate?: ( post: Partial<IPost> ) => void;
}

export type State = {
  editable: Partial<IPost>;
}

export class PostForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      editable: props.post ? { ...props.post } : {}
    };
  }

  componentDidMount() {
    if ( this.props.onFetch )
      this.props.onFetch( this.props.id! )
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.post !== this.props.post )
      this.setState( { editable: { ...next.post } } );
  }

  render() {
    if ( this.props.loading )
      return <CircularProgress />

    return <Form>
      <div>
        <TextField
          value={this.state.editable.title}
          floatingLabelText="Post Title"
          onChange={( e, value ) => this.setState( { editable: { ...this.state.editable, title: value } } )}
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
      </div>
    </Form>;
  }
}

const Form = styled.form`
  padding: 10px;
  display: flex;

  > div {
    flex: 1;
  }

  > div:nth-child(2) {
    margin: 0 0 0 20px;
  }
`;

const PublishPanel = styled.div`
  background: ${theme.light100.background };
  padding: 20px;
  border-radius: 5px;
  overflow: hidden;
`;