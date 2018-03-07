import * as React from 'react';
// import theme from '../theme/mui-theme';
import { Editor, EditorState, RichUtils, DraftBlockType, AtomicBlockUtils, ContentBlock, ContentState } from 'draft-js';
import { default as styled } from '../theme/styled';
import { DropDownMenu, MenuItem, RaisedButton, TextField } from 'material-ui';

type Props = {
  style?: React.CSSProperties;
}

type State = {
  editorState: EditorState;
  render: boolean;
  showMediaUrl: boolean,
  mediaUrl: string
};

export type BlockProps = {
  contentState: ContentState;
  block: ContentBlock;
}

export type MediaProps = {
  src: string;
}

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
  { label: 'Code Block', style: 'code-block' }
];

const INLINE_STYLES: { label: string; style: string }[] = [
  { label: 'B', style: 'BOLD' },
  { label: 'I', style: 'ITALIC' },
  { label: 'U', style: 'UNDERLINE' },
  { label: 'S', style: 'STRIKETHROUGH' }
];

const Audio = ( props: MediaProps ) => {
  return <audio controls src={props.src} />;
};

const Image = ( props: MediaProps ) => {
  return <img src={props.src} />;
};

const Video = ( props: MediaProps ) => {
  return <video controls src={props.src} />;
};

const Media = ( props: BlockProps ) => {
  const entity = props.contentState.getEntity(
    props.block.getEntityAt( 0 )
  );

  const { src } = entity.getData();
  const type = entity.getType();

  let media: JSX.Element | null = null;
  if ( type === 'audio' ) {
    media = <Audio src={src} />;
  } else if ( type === 'image' ) {
    media = <Image src={src} />;
  } else if ( type === 'video' ) {
    media = <Video src={src} />;
  }

  return media;
};

/**
 * The main application entry point
 */
export class PostEditor extends React.Component<Props, State> {

  private _editor: Editor | null;

  constructor( props: Props ) {
    super( props );

    this._editor = null;

    this.state = {
      editorState: EditorState.createEmpty(),
      render: false,
      showMediaUrl: false,
      mediaUrl: ''
    }
  }

  componentDidMount() {
    this.setState( { render: true } )
  }

  /**
   * Handles the most common key commands
   */
  _handleKeyCommand( command: string, state: EditorState ) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand( editorState, command );
    if ( newState ) {
      this.setState( { editorState: newState } )
      return 'handled';
    }
    return 'not-handled';
  }

  private focus() {
    this._editor!.focus();
  }

  private _toggleBlockType( blockType: DraftBlockType ) {
    this.setState( {
      editorState: RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    } );
  }

  private _toggleInlineStyle( inlineStyle: string ) {
    const editorState = RichUtils.toggleInlineStyle(
      this.state.editorState,
      inlineStyle
    );

    this.setState( { editorState } )
  }

  /**
   * When we add a new type of media object
   * @param url The url of the media
   * @param type The type of entity we want to create
   */
  private _confirmMedia( url: string, type: string ) {

    // Create a new entity
    const contentState = this.state.editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      type,
      'IMMUTABLE',
      { src: url }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(
      this.state.editorState,
      { currentContent: contentStateWithEntity }
    );

    // Create a new block and assign the entity to it
    this.setState( {
      editorState: AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        ' '
      ),
      showMediaUrl: false,
      mediaUrl: ''
    }, () => {
      setTimeout( () => this.focus(), 0 );
    } );
  }

  /**
   * Factory method for defining custom block renderers
   * @param block The block we are analyzing
   */
  private mediaBlockRenderer( block: ContentBlock ) {
    if ( block.getType() === 'atomic' ) {
      return {
        component: Media,
        editable: false,
      };
    }

    return null;
  }

  render() {
    const selection = this.state.editorState.getSelection();
    const blockType = this.state.editorState
      .getCurrentContent()
      .getBlockForKey( selection.getStartKey() )
      .getType();

    const activeStyles = this.state.editorState.getCurrentInlineStyle();

    return (
      <div style={this.props.style}>

        <div>
          <RaisedButton onClick={e => this.setState( { showMediaUrl: !this.state.showMediaUrl } )} label="All Media" />
          {this.state.showMediaUrl ?
            <TextField
              value={this.state.mediaUrl}
              onChange={( e, val ) => this.setState( { mediaUrl: val } )}
              onKeyDown={e => {
                if ( e.keyCode === 13 ) {
                  this.setState( {
                    showMediaUrl: false
                  } );

                  this._confirmMedia( this.state.mediaUrl, 'image' )
                }
              }}
            /> : undefined}
        </div>
        <div style={{ margin: '0 0 10px 0', cursor: 'pointer' }}>
          <DropDownMenu
            value={blockType}
            onChange={( e, index, val ) => this._toggleBlockType( val )}
          >
            {BLOCK_TYPES.map( ( block ) => <MenuItem key={block.style} value={block.style} primaryText={block.label} /> )}
          </DropDownMenu>

          {INLINE_STYLES.map( style => {
            const isActive = activeStyles.contains( style.style )
            return <span
              style={{ background: isActive ? '#ccc' : '' }}
              key={style.style}
              onClick={e => this._toggleInlineStyle( style.style )}
            >
              {style.label}
            </span>
          } )}



        </div>
        <EditorContainer>
          {this.state.render ?
            <Editor
              ref={elm => this._editor = elm}
              editorState={this.state.editorState}
              blockRendererFn={block => this.mediaBlockRenderer( block )}
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
