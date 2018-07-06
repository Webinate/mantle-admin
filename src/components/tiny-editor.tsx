import * as React from 'react';
import { Settings, EditorManager, Editor } from 'tinymce';
declare let tinymce: {
  init: ( settings: Settings ) => void;
  remove: ( selector: Editor ) => Editor;
  EditorManager: EditorManager;
};

export type Props = {
  id: string;
  className?: string;
  containerStyle?: React.CSSProperties;
  content: string;
  config: Settings;
  onContentChanged: ( content: string ) => void;
}

export type State = {
  editor: Editor | null;
}

export default class TinyEditor extends React.Component<Props, State> {
  private id: string;

  static defaultProps: Partial<Props> = {
    content: ''
  }

  constructor( props: Props ) {
    super( props );

    this.initialiseEditor = this.initialiseEditor.bind( this );
    this.removeEditor = this.removeEditor.bind( this );
    this.id = props.id;
    this.state = {
      editor: null
    };
  }

  componentDidMount() {
    if ( typeof window === 'undefined' || typeof document === 'undefined' )
      return;

    this.id = this.id || this.props.id

    this.initialiseEditor();
  }

  componentWillUnmount() {
    if ( this.state.editor ) {
      this.removeEditor();
    }
  }

  componentWillReceiveProps( next: Props ) {
    this.id = next.id;

    if ( !this.state.editor )
      this.initialiseEditor();
    else if ( this.props.content !== next.content )
      this.state.editor.setContent( next.content );
  }

  shouldComponentUpdate() {
    return false;
  }

  initialiseEditor() {
    if ( typeof window === 'undefined' )
      return;

    if ( this.state.editor )
      this.removeEditor();

    let config = this.props.config;
    config.selector = `#${ this.id }`;

    config.setup = ( editor: Editor ) => {
      this.setState( { editor } );

      editor.on( 'init', () => {
        editor.setContent( this.props.content );
      } );

      editor.on( 'keyup change', () => {
        const content = editor.getContent();
        this.props.onContentChanged( content );
      } );
    };

    tinymce!.init( config );
  }

  removeEditor() {
    tinymce!.remove( this.state.editor! );
    this.setState( {
      editor: null
    } );
  }

  render() {
    const { content, config, className } = this.props;

    if ( config.inline ) {
      return (
        <div style={this.props.containerStyle}>
          <div
            id={this.id}
            className={className}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      );
    } else {
      return (
        <div style={this.props.containerStyle}>
          <textarea
            id={this.id}
            style={{ visibility: 'hidden' }}
            defaultValue={content}
          />
        </div>
      );
    }
  }
}