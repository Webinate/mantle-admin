import * as React from 'react';
// import theme from '../theme/mui-theme';
import { Editor, EditorState, RichUtils, DraftBlockType } from 'draft-js';
import { default as styled } from '../theme/styled';

type Props = {

}

type State = {
  editorState: EditorState;
};

const BLOCK_TYPES: { label: string; style: DraftBlockType }[] = [
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

/**
 * The main application entry point
 */
export class PostEditor extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      editorState: EditorState.createEmpty()
    }
  }

  _handleKeyCommand( command: string, state: EditorState ) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand( editorState, command );
    if ( newState ) {
      this.setState( { editorState: newState } )
      return 'handled';
    }
    return 'not-handled';
  }

  _toggleBlockType( blockType: DraftBlockType ) {
    this.setState( {
      editorState: RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    } );
  }



  render() {
    const selection = this.state.editorState.getSelection();
    const blockType = this.state.editorState
      .getCurrentContent()
      .getBlockForKey( selection.getStartKey() )
      .getType();

    return (
      <PostEditorContainer>
        <div style={{ margin: '0 0 10px 0', cursor: 'pointer' }} className="RichEditor-controls">
          {BLOCK_TYPES.map( ( type ) => {

            const active = type.style === blockType;

            return (
              <span
                key={type.label}
                style={{ marginRight: '10px', background: active ? '#ccc' : '' }}
                onMouseDown={e => this._toggleBlockType( type.style )}
              >
                {type.label}
              </span>
            );
          }
          )}
        </div>
        <EditorContainer>
          {this.state.editorState ?
            <Editor
              editorState={this.state.editorState}
              handleKeyCommand={( command, state ) => this._handleKeyCommand( command, state )}
              onChange={editorState => this.setState( { editorState: editorState } )}
            /> : undefined}
        </EditorContainer>
      </PostEditorContainer>
    );
  }
};

const PostEditorContainer = styled.div`
  height: 100%;
`;

const EditorContainer = styled.div`
  background: #fff;
  padding: 20px;
`;
