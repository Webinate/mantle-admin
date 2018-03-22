import * as React from 'react';
import TinyEditor from '../tiny-editor';

export type Props = {
  content: string;
  onContentChanged: ( content: string ) => void;
}

export type State = {
  renderTiny: boolean;
}

export default class TinyPostEditor extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      renderTiny: false
    };
  }

  componentDidMount() {
    this.setState( {
      renderTiny: true
    } );
  }

  render() {
    return <div>
      {this.state.renderTiny ? <TinyEditor
        onContentChanged={this.props.onContentChanged}
        id="post-editor"
        content={this.props.content}
        config={{
          selector: '#post-editor',
          plugins:
            [
              'paste',
              'link',
              'code',
              'image'
            ]
        }}
      /> : undefined}
    </div>
  }
}