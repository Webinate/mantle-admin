import * as React from 'react';
import { TextField, Toggle, RaisedButton } from 'material-ui';
import { IPost } from 'modepress';
import { default as styled } from '../../theme/styled';
import TinyPostEditor from './tiny-post-editor';
import theme from '../../theme/mui-theme';

export type Props = {
  loading: boolean;
  post?: Partial<IPost> | null;
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
          value={this.state.editable.brief}
          floatingLabelText="Post Brief Description"
          onChange={( e, value ) => this.setState( { editable: { ...this.state.editable, brief: value } } )}
        />
        <br />
        <h3>Content</h3>
        <TinyPostEditor />
      </div>
      <div>
        <PublishPanel>
          <RaisedButton primary={true} fullWidth={true} label={this.props.post ? 'Update' : 'Publish'} />
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