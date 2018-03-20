import * as React from "react";
import { TextField, Toggle } from 'material-ui';
import { IPost } from 'modepress';
import { default as styled } from '../../theme/styled';
import TinyPostEditor from "./tiny-post-editor";
import theme from '../../theme/mui-theme';

export type Props = {
  loading: boolean;
  post: Partial<IPost> | null;
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
      <h2>{this.props.post ? 'Edit Post' : 'New Post'}</h2>
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
      <Toggle
        label="Post Public"
        labelPosition="right"
        toggled={this.state.editable.public ? true : false}
        onToggle={e => this.setState( { editable: { ...this.state.editable, public: this.state.editable.public ? false : true } } )}
      />
      <h3>Content</h3>
      <TinyPostEditor />
    </Form>;
  }
}

const Form = styled.form`
  background: ${theme.light100.background };
  padding: 10px;
`;