import * as React from 'react';
import { Editor, ContentState, convertFromHTML, EditorState, RichUtils, DraftHandleValue, DefaultDraftBlockRenderMap, getDefaultKeyBinding, DraftBlockType } from 'draft-js';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import { stateToHTML } from 'draft-js-export-html';
import { stateFromHTML } from 'draft-js-import-html';
import * as Immutable from 'immutable';
import DraftToolbar from '../draft/draft-toolbar';
import { IDraftElement } from 'modepress';

export type Props = {
  elements: IDraftElement<'client'>[];
  activeElement: string | null;
  onCreateElm: ( type: Partial<IDraftElement<'client'>> ) => void;
  onUpdateElm: ( id: string, html: string, createParagraph: boolean ) => void;
}

export type State = {
  editorState: EditorState;
  initialized: boolean;
  activeElm: string | null;
};

/**
 * The main application entry point
 */
export class DraftEditor extends React.Component<Props, State> {
  private _editor: Editor | null;
  private _blockRenderMap: any;

  constructor( props: Props ) {
    super( props );

    const activeElm = props.elements.find( e => e._id === props.activeElement );
    const initialState = activeElm ?
      EditorState.createWithContent( stateFromHTML( activeElm.html ) ) :
      EditorState.createEmpty();

    this.state = {
      editorState: initialState,
      initialized: false,
      activeElm: props.activeElement
    };

    const blockRenderMap = Immutable.Map<any, any>( {
      'paragraph': {
        element: 'p'
      },
      'unstyled': {
        element: 'p'
      }
    } );

    this._editor = null;
    this._blockRenderMap = DefaultDraftBlockRenderMap.merge( blockRenderMap );
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.activeElement && next.activeElement !== this.props.activeElement )
      this.setState( { activeElm: next.activeElement }, () => {
        const elm = next.elements.find( e => e._id === next.activeElement );
        if ( elm )
          this.initDraftState( elm );
      } );
  }

  componentDidMount() {
    if ( typeof window === 'undefined' || typeof document === 'undefined' )
      return;
    else
      this.setState( { initialized: true } );
  }

  private initDraftState( elm: IDraftElement<'client'> ) {
    // const contentState = stateFromHTML( elm.html );
    const blocksFromHTML = convertFromHTML( elm.html );
    const state = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );

    this.setState( {
      activeElm: elm._id,
      editorState: EditorState.createWithContent( state )
    }, () => {
      if ( this._editor )
        this._editor.focus();
    } );
  }

  // private focusEditor() {
  //   if ( this._editor )
  //     this._editor.focus();
  // }

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

    this.updateElmHtml( id, state, true );
    // setTimeout( () => {
    //   const newId = this._createBlock( 'paragraph' );
    //   this.setState( { activeElm: newId }, () => this.focusEditor() );
    // }, 100 );

    return 'handled';
  }

  private updateElmHtml( id: string, state: EditorState, createParagraph: boolean ) {
    const contentState = state.getCurrentContent();
    let html = stateToHTML( contentState );
    this.props.onUpdateElm( id, html, createParagraph );
  }

  // private updateElmHtml( id: string, state: EditorState ) {
  //   const contentState = state.getCurrentContent();
  //   let html = stateToHTML( contentState );

  //   this.setState( {
  //     elements: this.state.elements.map( elm => {
  //       if ( elm.id === id )
  //         return { ...elm, html: html };
  //       else
  //         return elm;
  //     } ),
  //     activeElm: null,
  //     editorState: EditorState.createEmpty()
  //   } );
  // }

  // private _createBlock( s: string ): string {
  //   const document = this.props.post.document as IDocument<'client'>;
  //   const draft = document.currentDraft as IPopulatedDraft<'client'>;
  //   const elements = draft.elements;

  //   const newId = this.state.elements.length.toString();

  //   let newState = EditorState.createEmpty();
  //   newState = RichUtils.toggleBlockType( newState, s );

  //   this.setState( {
  //     editorState: newState,
  //     elements: this.state.elements.concat(
  //       { html: '', id: newId }
  //     ),
  //     activeElm: this.state.elements.length.toString()
  //   } );

  //   setTimeout( () => this.focusEditor(), 500 );
  //   return newId;
  // }

  private _onCreateElm( type: DraftBlockType ) {
    if ( type === 'paragraph' )
      this.props.onCreateElm( { type: 'elm-paragraph', html: '<p></p>' } );
    if ( type === 'header-one' )
      this.props.onCreateElm( { type: 'elm-header-1', html: '<h1></h1>' } );
    if ( type === 'header-two' )
      this.props.onCreateElm( { type: 'elm-header-2', html: '<h2> </h2>' } );
    if ( type === 'header-three' )
      this.props.onCreateElm( { type: 'elm-header-3', html: '<h3> </h3>' } );
    if ( type === 'header-four' )
      this.props.onCreateElm( { type: 'elm-header-4', html: '<h4> </h4>' } );
    if ( type === 'header-five' )
      this.props.onCreateElm( { type: 'elm-header-5', html: '<h5></h5>' } );
    if ( type === 'header-six' )
      this.props.onCreateElm( { type: 'elm-header-6', html: '<h6>This is a header</h6>' } );
    if ( type === 'code-block' )
      this.props.onCreateElm( { type: 'elm-code', html: '<pre></pre>' } );
    if ( type === 'ordered-list-item' )
      this.props.onCreateElm( { type: 'elm-list', html: '<ol><li></li></ol>' } );
    if ( type === 'unordered-list-item' )
      this.props.onCreateElm( { type: 'elm-list', html: '<ul><li></li></ul>' } );
  }

  render() {
    if ( !this.state.initialized )
      return <div></div>;

    const elements = this.props.elements;
    const currentStyle = this.state.editorState.getCurrentInlineStyle();
    const selection = this.state.editorState.getSelection();
    const blockType = this.state.editorState
      .getCurrentContent()
      .getBlockForKey( selection.getStartKey() )
      .getType();

    return (
      <div>
        <Container>
          <DraftToolbar
            onCreateBlock={type => this._onCreateElm( type.type )}
            onAddMedia={() => { }}
            activeStyle={currentStyle}
            onInlineToggle={styleStyle => this.setState( { editorState: RichUtils.toggleInlineStyle( this.state.editorState, styleStyle.type ) } )}
            activeBlockType={blockType}

          />

          <div
            className="mt-editor-container"
          >
            {elements.map( elm => {
              if ( this.state.activeElm === elm._id )
                return (
                  <div
                    key={elm._id}
                    className={`mt-element active`}
                  >
                    <Editor
                      ref={e => this._editor = e}
                      onBlur={() => this.updateElmHtml( elm._id, this.state.editorState, false )}
                      blockRenderMap={this._blockRenderMap}
                      keyBindingFn={e => this.mapKeyToEditorCommand( e )}
                      onTab={e => this.mapKeyToEditorCommand( e )}
                      editorState={this.state.editorState}
                      handleReturn={( e, state ) => this._onReturn( elm._id, state, e )}
                      handleKeyCommand={( command, state ) => this._handleKeyCommand( command, state )}
                      onChange={e => {
                        this.setState( { editorState: e } );
                      }}
                    />
                  </div>
                );

              return <div
                key={elm._id}
                className="mt-element"
                onClick={e => this.initDraftState( elm )}
                dangerouslySetInnerHTML={{ __html: elm.html }}
              />;
            } )}
          </div>
        </Container>
      </div>
    );
  }
}

const Container = styled.div`
  overflow: auto;
  padding: 0;
  min-height: 300px;
  box-sizing: border-box;
  background: ${theme.light100.background };
  border: 1px solid ${theme.light100.border };
  color: ${theme.light100.color };
  border-radius: 4px;

  .mt-editor-container {
    code {
      font-family: monospace;
    }

    p {
      margin: 5px 0;
    }
  }


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
    padding: 10px;
    box-sizing: border-box;
  }
`;