import * as React from 'react';
import { Editor, EditorState, RichUtils, DraftHandleValue, DefaultDraftBlockRenderMap, getDefaultKeyBinding } from 'draft-js';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import * as Immutable from 'immutable';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  editorState: EditorState;
  initialized: boolean;
  activeElm: string | null;
  elements: { html: string; id: string; }[];
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class DraftEditor extends React.Component<Props, State> {
  private _editor: Editor | null;
  private _blockRenderMap: any;

  constructor( props: Props ) {
    super( props );
    this.state = {
      editorState: EditorState.createEmpty(),
      initialized: false,
      elements: [],
      activeElm: null
    };

    const blockRenderMap = Immutable.Map( {
      'paragraph': {
        element: 'p'
      },
      'unstyled': {
        element: 'p'
      }
    } as any );

    this._blockRenderMap = DefaultDraftBlockRenderMap.merge( blockRenderMap );
  }

  componentDidMount() {
    if ( typeof window === 'undefined' || typeof document === 'undefined' )
      return;
    else
      this.setState( { initialized: true } );

    this.focusEditor();
  }

  private focusEditor() {
    if ( this._editor )
      this._editor.focus();
  }

  private _handleKeyCommand( command: string, editorState: EditorState ) {
    const newState = RichUtils.handleKeyCommand( editorState, command );
    if ( newState ) {
      this.setState( { editorState: newState } );
      return 'handled';
    }

    return 'not-handled';
  }

  private mapKeyToEditorCommand( e: React.KeyboardEvent<{}> ) {
    // Handle tab
    if ( e.keyCode === 9 ) {
      const newEditorState = RichUtils.onTab( e, this.state.editorState, 4 );
      if ( newEditorState !== this.state.editorState )
        this.setState( { editorState: newEditorState } );

      return null;
    }

    return getDefaultKeyBinding( e );
  }

  private _onReturn( id: string, state: EditorState, e: React.KeyboardEvent<{}> ): DraftHandleValue {
    const selection = state.getSelection();
    const blockType = state
      .getCurrentContent()
      .getBlockForKey( selection.getStartKey() )
      .getType();

    if ( blockType === 'ordered-list-item' || blockType === 'unordered-list-item' || blockType === 'unstyled' )
      return 'not-handled';
    if ( blockType === 'code-block' && e.shiftKey ) {
      this.setState( { editorState: RichUtils.insertSoftNewline( state ) } );
      return 'handled';
    }

    this.updateElmHtml( id, state );
    setTimeout( () => {
      const newId = this._createBlock( 'paragraph', 'paragraph' );
      this.setState( { activeElm: newId }, () => this.focusEditor() );
    }, 100 );

    return 'handled';
  }

  private updateElmHtml( id: string, state: EditorState ) {
    const contentState = state.getCurrentContent();
    let html = stateToHTML( contentState );

    this.setState( {
      elements: this.state.elements.map( elm => {
        if ( elm.id === id )
          return { ...elm, html: html };
        else
          return elm;
      } ),
      activeElm: null,
      editorState: EditorState.createEmpty()
    } );
  }

  private _createBlock( type: string, s: string ): string {
    const newId = this.state.elements.length.toString();

    let newState = EditorState.createEmpty();
    newState = RichUtils.toggleBlockType( newState, s );

    this.setState( {
      editorState: newState,
      elements: this.state.elements.concat(
        { html: '', id: newId }
      ),
      activeElm: this.state.elements.length.toString()
    }, () => this.focusEditor() );
    return newId;
  }

  render() {
    if ( !this.state.initialized )
      return <div></div>;

    const INLINE_STYLES = [
      { label: 'Bold', style: 'BOLD' },
      { label: 'Italic', style: 'ITALIC' },
      { label: 'Underline', style: 'UNDERLINE' },
      { label: 'Monospace', style: 'CODE' },
    ];
    const BLOCK_TYPES = [
      { label: 'H1', style: 'header-one' },
      { label: 'H2', style: 'header-two' },
      { label: 'H3', style: 'header-three' },
      { label: 'H4', style: 'header-four' },
      { label: 'H5', style: 'header-five' },
      { label: 'H6', style: 'header-six' },
      { label: 'Blockquote', style: 'blockquote' },
      { label: 'UL', style: 'unordered-list-item' },
      { label: 'OL', style: 'ordered-list-item' },
      { label: 'Code Block', style: 'code-block' },
      { label: 'Paragraph', style: 'paragraph' }
    ];

    const currentStyle = this.state.editorState.getCurrentInlineStyle();
    const selection = this.state.editorState.getSelection();
    const blockType = this.state.editorState
      .getCurrentContent()
      .getBlockForKey( selection.getStartKey() )
      .getType();

    return (
      <div style={{ height: '100%' }}>
        <Container>
          {BLOCK_TYPES.map( s => <Button
            key={s.label}
            style={{
              margin: '0 10px 0 0',
              fontWeight: s.style === blockType ? 'bold' : undefined
            }}
            onClick={e => {
              this._createBlock( s.label, s.style )
            }}
          >{s.label}</Button> )}

          {INLINE_STYLES.map( s => <Button
            key={s.label}
            style={{
              margin: '0 10px 0 0',
              fontWeight: currentStyle.has( s.style ) ? 'bold' : undefined
            }}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();

              this.setState( {
                editorState: RichUtils.toggleInlineStyle( this.state.editorState, s.style )
              } );
            }}
          >{s.label}</Button> )}


          <div
            className="mt-editor-container"
          >
            {this.state.elements.map( elm => {
              if ( this.state.activeElm === elm.id )
                return (
                  <div
                    key={elm.id}
                    className={`mt-element active`}
                  >
                    <Editor
                      onBlur={() => this.updateElmHtml( elm.id, this.state.editorState )}
                      blockRenderMap={this._blockRenderMap}
                      ref={editor => this._editor = editor}
                      keyBindingFn={e => this.mapKeyToEditorCommand( e )}
                      onTab={e => this.mapKeyToEditorCommand( e )}
                      editorState={this.state.editorState}
                      handleReturn={( e, state ) => this._onReturn( elm.id, state, e )}
                      handleKeyCommand={( command, state ) => this._handleKeyCommand( command, state )}
                      onChange={e => {
                        this.setState( { editorState: e } );
                      }}
                    />
                  </div>
                );

              return <div
                key={elm.id}
                className="mt-element"
                onClick={e => {
                  const contentState = stateFromHTML( elm.html );
                  this.setState( {
                    activeElm: elm.id,
                    editorState: EditorState.createWithContent( contentState )
                  }, () => this.focusEditor() );
                }}
                dangerouslySetInnerHTML={{ __html: elm.html }}
              />;
            } )}

          </div>

        </Container>
      </div>
    );
  }
}


const Button = styled.div`
  margin: 0 10px 0 0;
  cursor: pointer;
  display: inline-block;
`;

const Container = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;

  .mt-element {
    border: 1px dashed transparent;
    padding: 5px;

    &.active, &:hover {
      border: 1px dashed ${ theme.light200.border };
    }

    &.active {
      background: ${ theme.light200.background };
      color: ${ theme.light200.color };
    }

    box-sizing: border-box;
  }

  .mt-editor-container {
    padding: 5px;
    box-sizing: border-box;
    background: ${ theme.light100.background };
  }
`;