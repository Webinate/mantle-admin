import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { ContentHeader } from '../components/content-header';
import { TextField, IconButton } from 'material-ui';
import { Editor, EditorState, RichUtils } from 'draft-js';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  userState: state.users,
  auth: state.authentication,
  admin: state.admin,
  app: state.app
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  searchFilter: string;
  editorState: EditorState;
  editor: boolean;
};

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

const BlockStyleControls = ( props: any ) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey( selection.getStartKey() )
    .getType();

  return (
    <div style={{ margin: '0 0 10px 0', cursor: 'pointer' }} className="RichEditor-controls">
      {BLOCK_TYPES.map( ( type: any ) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

class StyleButton extends React.Component<{ active: boolean; label: string; style: any; onToggle: ( style: string ) => void; }> {
  constructor() {
    super();
  }

  onToggle( e: React.MouseEvent<{}> ) {
    e.preventDefault();
    this.props.onToggle( this.props.style );
  }

  render() {
    let className = 'RichEditor-styleButton';
    if ( this.props.active ) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span style={{ marginRight: '10px' }} className={className} onMouseDown={e => this.onToggle( e )}>
        {this.props.label}
      </span>
    );
  }
}

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Posts extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      searchFilter: '',
      editor: false,
      editorState: EditorState.createEmpty()
    }
  }

  componentWillMount() {
  }

  // Once component mounts, enable editor
  componentDidMount() {
    this.setState( {
      editor: true
    } )
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

  _toggleBlockType( blockType: any ) {
    this.setState( {
      editorState: RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    } );
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <ContentHeader title="Posts"
          renderFilters={() => {
            return <div>
              <TextField
                className="posts-filter"
                hintText="Filter username or email"
                id="mt-posts-filter"
                value={this.state.searchFilter}
                onKeyDown={e => {
                }}
                onChange={( e, text ) => this.setState( { searchFilter: text } )}
              />
              <IconButton
                name="posts-search-button"
                style={{ verticalAlign: 'top' }}
                iconStyle={{ color: theme.primary200.background }}
                iconClassName="icon icon-search"
              />
            </div>
          }}>
        </ContentHeader>
        <div style={{ padding: '10px' }}>
          <BlockStyleControls
            editorState={this.state.editorState}
            onToggle={( blockType: any ) => this._toggleBlockType( blockType )}
          />
          <div style={{ background: '#fff', padding: '20px' }}>
            {this.state.editor ? <Editor
              editorState={this.state.editorState}
              handleKeyCommand={( command, state ) => this._handleKeyCommand( command, state )}
              onChange={editorState => this.setState( { editorState: editorState } )}
            /> : undefined}
          </div>
        </div>
      </div >
    );
  }
};