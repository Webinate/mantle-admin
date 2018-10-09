import * as React from 'react';
import { Editor, EditorState, RichUtils, convertToRaw } from 'draft-js';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { default as styled } from '../theme/styled';

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
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class DraftEditor extends React.Component<Props, State> {
  private _editor: Editor | null;
  constructor( props: Props ) {
    super( props );
    this.state = {
      editorState: EditorState.createEmpty(),
      initialized: false
    };
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
    ];

    const rawContentState = convertToRaw( this.state.editorState.getCurrentContent() );
    rawContentState;

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
              e.preventDefault();
              this.setState( {
                editorState: RichUtils.toggleBlockType( this.state.editorState, s.style )
              } );
            }}
          >{s.label}</Button> )}

          {INLINE_STYLES.map( s => <Button
            key={s.label}
            style={{
              margin: '0 10px 0 0',
              fontWeight: currentStyle.has( s.style ) ? 'bold' : undefined
            }}
            onClick={e => {
              e.preventDefault();
              this.setState( {
                editorState: RichUtils.toggleInlineStyle( this.state.editorState, s.style )
              } );
            }}
          >{s.label}</Button> )}


          <div onClick={e => this.focusEditor()}>
            <Editor
              ref={editor => this._editor = editor}
              editorState={this.state.editorState}
              handleKeyCommand={( command, state ) => this._handleKeyCommand( command, state )}
              onChange={e => {
                this.setState( { editorState: e } );
              }}
              placeholder="Write something colorful..."
            />
          </div>

        </Container>
      </div>
    );
  }
}


const Button = styled.div`
  margin: 0 10px 0 0;
  cursor: pointer;
`;

const Container = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;