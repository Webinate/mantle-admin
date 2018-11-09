import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import EditorToolbar from './editor-toolbar';
import { IDraftElement } from 'modepress';
import { InlineType } from './editor-toolbar';

export type Props = {
  elements: IDraftElement<'client'>[];
  activeElement: string | null;
  onCreateElm: ( type: Partial<IDraftElement<'client'>> ) => void;
  onUpdateElm: ( id: string, html: string, createParagraph: boolean ) => void;
}

export type State = {
  initialized: boolean;
  activeElm: string | null;
};

/**
 * The main application entry point
 */
export class ElmEditor extends React.Component<Props, State> {
  private _activeElm: HTMLElement;
  private _firstElm: HTMLElement;

  constructor( props: Props ) {
    super( props );
    this.state = {
      initialized: false,
      activeElm: props.activeElement
    };
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.activeElement && next.activeElement !== this.props.activeElement )
      this.setState( { activeElm: next.activeElement } );
  }

  componentDidMount() {
    if ( typeof window === 'undefined' || typeof document === 'undefined' )
      return;
    else
      this.setState( { initialized: true } );
  }

  private clean( node: Node ) {
    for ( var n = 0; n < node.childNodes.length; n++ ) {
      const child = node.childNodes[ n ];
      if ( child.nodeType === 8 || ( child.nodeType === 3 && !/\S/.test( child.nodeValue! ) ) ) {
        node.removeChild( child );
        n--;
      }
      else if ( child.nodeType === 1 ) {
        this.clean( child );
      }
    }
  }

  private updateElmHtml( elm: IDraftElement<'client'>, createParagraph: boolean ) {

    this.clean( this._activeElm );
    const first = this._activeElm.firstElementChild as HTMLElement;
    const firstInnerChild = first.firstElementChild;
    const lastInnerChild = first.lastElementChild;
    if ( firstInnerChild && firstInnerChild.parentNode && firstInnerChild instanceof HTMLBRElement )
      first.removeChild( firstInnerChild );
    if ( lastInnerChild && lastInnerChild.parentNode && lastInnerChild instanceof HTMLBRElement )
      first.removeChild( lastInnerChild );

    let html = first.outerHTML;
    if ( elm.html !== html ) {
      this.props.onUpdateElm( elm._id, html, createParagraph );
    }
  }

  private focusLast( el: HTMLElement ) {
    el.focus();
    if ( typeof window.getSelection != "undefined" && typeof document.createRange != "undefined" ) {
      var range = document.createRange();
      range.selectNodeContents( el );
      range.collapse( false );
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange( range );
    }
    else if ( typeof ( document.body as any ).createTextRange != "undefined" ) {
      var textRange = ( document.body as any ).createTextRange();
      textRange.moveToElementText( el );
      textRange.collapse( false );
      textRange.select();
    }
  }

  private _onCreateElm( type: string ) {
    if ( type === 'paragraph' )
      this.props.onCreateElm( { type: 'elm-paragraph', html: '<p></p>' } );
    if ( type === 'header-one' )
      this.props.onCreateElm( { type: 'elm-header-1', html: '<h1></h1>' } );
    if ( type === 'header-two' )
      this.props.onCreateElm( { type: 'elm-header-2', html: '<h2></h2>' } );
    if ( type === 'header-three' )
      this.props.onCreateElm( { type: 'elm-header-3', html: '<h3></h3>' } );
    if ( type === 'header-four' )
      this.props.onCreateElm( { type: 'elm-header-4', html: '<h4></h4>' } );
    if ( type === 'header-five' )
      this.props.onCreateElm( { type: 'elm-header-5', html: '<h5></h5>' } );
    if ( type === 'header-six' )
      this.props.onCreateElm( { type: 'elm-header-6', html: '<h6></h6>' } );
    if ( type === 'code-block' )
      this.props.onCreateElm( { type: 'elm-code', html: '<pre></pre>' } );
    if ( type === 'ordered-list-item' )
      this.props.onCreateElm( { type: 'elm-list', html: '<ol><li></li></ol>' } );
    if ( type === 'unordered-list-item' )
      this.props.onCreateElm( { type: 'elm-list', html: '<ul><li></li></ul>' } );
  }

  private editElm( e: React.MouseEvent<HTMLElement>, elm: IDraftElement<'client'> ) {
    this.setState( {
      activeElm: elm._id
    } );
  }

  private toggleInline( inline: InlineType ) {
    document.execCommand( inline.type.toLowerCase(), false, undefined );
  }

  private activateElm( elm: HTMLElement ) {
    this._activeElm = elm;
    this._firstElm = elm.firstElementChild as HTMLElement;

    // if ( this._firstElm.children.length === 0 )
    //  this._firstElm.appendChild( document.createElement( 'br' ) );

    this.focusLast( this._firstElm );

  }

  private clear( elm: HTMLElement ) {
    while ( elm.firstChild )
      elm.removeChild( elm.firstChild );
  }

  private onKeyUp( e: React.KeyboardEvent<HTMLElement> ) {
    // Backkspace / Delete
    if ( e.keyCode === 8 || e.keyCode === 46 ) {

      if ( this._activeElm.children.length === 0 || this._activeElm.children[ 0 ].tagName !== this._firstElm.tagName ) {
        this.clear( this._activeElm );
        this.clear( this._firstElm );
        this._firstElm = this._firstElm.cloneNode() as HTMLElement;
        this._activeElm.append( this._firstElm );
        this.focusLast( this._firstElm );
      }
    }
  }

  private onKeyDown( e: React.KeyboardEvent<HTMLElement> ) {
    let command = '';


    // Tab
    if ( e.keyCode === 9 )
      command = e.shiftKey ? 'outdent' : 'indent';
    if ( e.ctrlKey && e.keyCode === 66 )
      command = 'bold';
    if ( e.ctrlKey && e.keyCode === 73 )
      command = 'italic';
    if ( e.ctrlKey && e.keyCode === 85 )
      command = 'underline';


    if ( command !== '' ) {
      document.execCommand( command, false, undefined );
      e.preventDefault();
      e.stopPropagation();
    }
  }

  render() {
    if ( !this.state.initialized )
      return <div></div>;

    const elements = this.props.elements;

    return (
      <div>
        <Container>
          <EditorToolbar
            onCreateBlock={type => this._onCreateElm( type.type )}
            onAddMedia={() => { }}
            onInlineToggle={styleStyle => this.toggleInline( styleStyle )}
          />

          <div
            className="mt-editor-container"
          >
            {elements.map( elm => {
              if ( this.state.activeElm === elm._id )
                return (
                  <div
                    key={elm._id}
                    ref={e => {
                      if ( !e )
                        return;

                      this.activateElm( e );
                    }}
                    onBlur={e => this.updateElmHtml( elm, false )}
                    className={`mt-element active`}
                    dangerouslySetInnerHTML={{ __html: elm.html || '<p></p>' }}
                    contentEditable={true}
                    onKeyDown={e => this.onKeyDown( e )}
                    onKeyUp={e => this.onKeyUp( e )}
                  />
                );

              return <div
                key={elm._id}
                className="mt-element"
                onClick={e => this.editElm( e, elm )}
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

  font-weight: thinner;
  b, strong {
    font-weight: bold;
  }

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
    > * { min-height: 10px; }

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