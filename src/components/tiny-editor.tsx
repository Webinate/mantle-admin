import * as React from 'react';
import { Settings, EditorManager, Editor } from 'tinymce';
let tinymce: {
  init: ( settings: Settings ) => void;
  remove: ( selector: Editor ) => Editor;
  EditorManager: EditorManager;
} | null = null;

if ( process.env.client === 'client' ) {

  tinymce = require( 'tinymce/tinymce' );

  // A theme is also required
  require( 'tinymce/themes/modern/theme' );

  // Any plugins you want to use has to be imported
  require( 'tinymce/plugins/paste' );
  require( 'tinymce/plugins/link' );
  require( 'tinymce/plugins/code' );
  require( 'tinymce/plugins/image' );
}

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

    const component = this;

    let config = this.props.config;
    config.selector = `#${ component.id }`;

    config.setup = ( editor: Editor ) => {
      component.setState( { editor } );

      editor.on( 'init', () => {
        editor.setContent( component.props.content );
      } );

      editor.on( 'keyup change', () => {
        const content = editor.getContent();
        component.props.onContentChanged( content );
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