import * as React from 'react';
import TinyEditor from '../tiny-editor';

export type Props = {

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
        onContentChanged={content => { }}
        id="post-editor"
        content=""
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