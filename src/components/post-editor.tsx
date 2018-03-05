import * as React from 'react';
// import theme from '../theme/mui-theme';
import { Editor, EditorState, RichUtils, DraftBlockType } from 'draft-js';
import { default as styled } from '../theme/styled';
import { DropDownMenu, MenuItem } from 'material-ui';

type Props = {
  style?: React.CSSProperties;
}

type State = {
  editorState: EditorState;
  render: boolean;

};

const BLOCK_TYPES: { label: string; style: DraftBlockType }[] = [
  { label: 'Regular', style: 'unstyled' },
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'P', style: 'paragraph' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
  { label: 'Atomic', style: 'atomic' }
];

/**
 * The main application entry point
 */
export class PostEditor extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );

    this.state = {
      editorState: EditorState.createEmpty(),
      render: false
    }
  }

  componentDidMount() {
    this.setState( { render: true } )
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
      <div style={this.props.style}>
        <div style={{ margin: '0 0 10px 0', cursor: 'pointer' }}>
          <DropDownMenu
            value={blockType}
            onChange={( e, index, val ) => this._toggleBlockType( val )}
          >
            {BLOCK_TYPES.map( ( block ) => <MenuItem value={block.style} primaryText={block.label} /> )}
          </DropDownMenu>


        </div>
        <EditorContainer>
          {this.state.render ?
            <Editor
              editorState={this.state.editorState}
              handleKeyCommand={( command, state ) => this._handleKeyCommand( command, state )}
              onChange={editorState => this.setState( { editorState: editorState } )}
            /> : undefined}
        </EditorContainer>
      </div>
    );
  }
};

const EditorContainer = styled.div`
  background: #fff;
  padding: 20px;
`;
