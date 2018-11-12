import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import EditorToolbar from './editor-toolbar';
import { IDraftElement } from 'modepress';
import { InlineType } from './editor-toolbar';

export type Props = {
  elements: IDraftElement<'client'>[];
  selected: string[];
  onSelectionChanged: ( ids: string[] ) => void;
  onCreateElm: ( type: Partial<IDraftElement<'client'>> ) => void;
  onDeleteElm: ( ids: string[] ) => void;
  onUpdateElm: ( id: string, html: string, createParagraph: boolean ) => void;
}

export type State = {
  initialized: boolean;
};

/**
 * The main application entry point
 */
export class ElmEditor extends React.Component<Props, State> {
  private _activeElm: HTMLElement;
  private _firstElm: HTMLElement;
  private _keyProxy: any;

  constructor( props: Props ) {
    super( props );
    this._keyProxy = this.onWindowKeyDown.bind( this );
    this.state = {
      initialized: false
    };
  }

  componentDidMount() {
    if ( typeof window === 'undefined' || typeof document === 'undefined' )
      return;
    else
      this.setState( { initialized: true } );

    window.addEventListener( 'keydown', this._keyProxy );
  }

  componentWillUnmount() {
    window.removeEventListener( 'keydown', this._keyProxy );
  }

  private onWindowKeyDown( e: KeyboardEvent ) {
    // Delete
    if ( e.keyCode === 46 && this.props.selected.length > 1 )
      this.props.onDeleteElm( this.props.selected );
  }

  private clean( node: Node ) {
    for ( let n = 0; n < node.childNodes.length; n++ ) {
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
    if ( elm.html !== html )
      this.props.onUpdateElm( elm._id, html, createParagraph );
    else if ( createParagraph )
      this.props.onCreateElm( { type: 'elm-paragraph' } );
  }

  private focusLast( el: HTMLElement ) {
    el.focus();
    if ( typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined" ) {
      var range = document.createRange();
      range.selectNodeContents( el );
      range.collapse( false );
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange( range );

      if ( !this.elementInViewport( el ) )
        el.scrollIntoView();
      el.parentElement!.focus();
    }
    else if ( typeof ( document.body as any ).createTextRange !== "undefined" ) {
      const textRange = ( document.body as any ).createTextRange();
      textRange.moveToElementText( el );
      textRange.collapse( false );
      textRange.select();
    }
  }

  /**
   * Checks if an element is in view
   */
  private elementInViewport( el: HTMLElement ) {
    let top = el.offsetTop;
    let left = el.offsetLeft;
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    while ( el.offsetParent ) {
      el = el.offsetParent as HTMLElement;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top >= window.pageYOffset &&
      left >= window.pageXOffset &&
      ( top + height ) <= ( window.pageYOffset + window.innerHeight ) &&
      ( left + width ) <= ( window.pageXOffset + window.innerWidth )
    );
  }

  /**
   * Select the active elements
   */
  private onElmDown( e: React.MouseEvent<HTMLElement>, elm: IDraftElement<'client'> ) {
    if ( !e.ctrlKey && !e.shiftKey ) {
      this.props.onSelectionChanged( [ elm._id ] );
    }
    else if ( e.ctrlKey ) {
      if ( this.props.selected.indexOf( elm._id ) === -1 )
        this.props.onSelectionChanged( this.props.selected.concat( elm._id ) );
      else
        this.props.onSelectionChanged( this.props.selected.filter( i => i !== elm._id ) );
    }
    else {
      const elements = this.props.elements.map( elm => elm._id );
      const selected = this.props.selected;

      let firstIndex = Math.min( elements.indexOf( elm._id ), selected.length > 0 ? elements.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( elements.indexOf( elm._id ), selected.length > 0 ? selected.indexOf( selected[ 0 ] ) : 0 );

      this.props.onSelectionChanged( elements.slice( firstIndex, lastIndex + 1 ) );
    }
  }

  /**
   * Toggle an inline style
   */
  private toggleInline( inline: InlineType ) {
    document.execCommand( inline, false, undefined );
  }

  /**
   * Activates an element for editing
   */
  private activateElm( elm: HTMLElement ) {
    this._activeElm = elm;
    this._firstElm = elm.firstElementChild as HTMLElement;
    this.focusLast( this._firstElm );
  }

  /**
   * Remove all child elements from a node
   */
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

  private getSelectedElement() {
    const elements = this.props.elements;
    const selection = this.props.selected;
    if ( selection.length === 0 )
      return null;

    const activeElm = elements.find( e => e._id === selection[ selection.length - 1 ] );
    if ( !activeElm )
      return null;

    return activeElm;
  }

  private onEnter( e: React.KeyboardEvent<HTMLElement> ) {
    const selectedElm = this.getSelectedElement();

    if ( selectedElm && selectedElm.type !== 'elm-list' ) {
      e.preventDefault();
      e.stopPropagation();
      this.updateElmHtml( selectedElm, true );
    }
  }

  private onKeyDown( e: React.KeyboardEvent<HTMLElement> ) {
    let inline = '';

    // Tab
    if ( e.keyCode === 9 )
      inline = e.shiftKey ? 'outdent' : 'indent';
    else if ( e.ctrlKey && e.keyCode === 66 )
      inline = 'bold';
    else if ( e.ctrlKey && e.keyCode === 73 )
      inline = 'italic';
    else if ( e.ctrlKey && e.keyCode === 85 )
      inline = 'underline';
    // Enter
    else if ( e.keyCode === 13 )
      return this.onEnter( e );

    if ( inline !== '' ) {
      document.execCommand( inline, false, undefined );
      e.preventDefault();
      e.stopPropagation();
    }
  }

  render() {
    if ( !this.state.initialized )
      return <div></div>;

    const elements = this.props.elements;
    const selection = this.props.selected;
    let firstIndex = -1;
    let lastIndex = -1;

    if ( selection.length > 0 ) {
      firstIndex = elements.findIndex( e => selection[ 0 ] === e._id );
      lastIndex = elements.findIndex( e => selection[ selection.length - 1 ] === e._id );
    }

    return (
      <div>
        <Container
          firstIndex={firstIndex}
          lastIndex={lastIndex}
        >
          <EditorToolbar
            onCreateBlock={( type, html ) => this.props.onCreateElm( { type, html } )}
            onAddMedia={() => { }}
            onInlineToggle={styleStyle => this.toggleInline( styleStyle )}
          />

          <div
            className="mt-editor-container"
          >
            {elements.map( ( elm, index ) => {

              if ( selection.length === 1 && selection[ 0 ] === elm._id )
                return (
                  <div
                    key={`elm-${ index }`}
                    ref={e => {
                      if ( !e )
                        return;

                      setTimeout( () => this.activateElm( e ), 200 );

                    }}
                    onBlur={e => this.updateElmHtml( elm, false )}
                    className={`mt-element active focussed`}
                    dangerouslySetInnerHTML={{ __html: elm.html || '<p></p>' }}
                    contentEditable={true}
                    onKeyDown={e => this.onKeyDown( e )}
                    onKeyUp={e => this.onKeyUp( e )}
                  />
                );

              return <div
                key={`elm-${ index }`}
                className={`mt-element${ selection.includes( elm._id ) ? ' active' : '' }`}
                onClick={e => this.onElmDown( e, elm )}
                dangerouslySetInnerHTML={{ __html: elm.html }}
              />;
            } )}
          </div>
        </Container>
      </div>
    );
  }
}

export interface EditorStyleProps {
  firstIndex: number;
  lastIndex: number;
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

  [contenteditable]:focus {
    outline: none;
  }

  h1:empty { min-height: 30px; }
  h2:empty { min-height: 25px; }
  h3:empty { min-height: 20px; }
  h4:empty { min-height: 16px; }
  h5:empty { min-height: 14px; }
  h6:empty { min-height: 11px; }
  p:empty, pre:empty { min-height: 17px; }


  .mt-element {
    border: 1px solid transparent;
    padding: 5px;
    > * { min-height: 10px; }

    &.focussed {

    }

    &.active {
      background: ${ theme.light200.background };
      color: ${ theme.light200.color };
    }

    ${ ( props: EditorStyleProps ) => props.firstIndex !== -1 ? `
      &.active {
        border-left: 1px dashed ${ theme.primary100.border };
        border-right: 1px dashed ${ theme.primary100.border };
      }
      &:nth-child( ${ props.firstIndex + 1 } ) {
        border-top: 1px dashed ${ theme.primary100.border };
      }
      &:nth-child( ${ props.lastIndex + 1 } ) {
        border-bottom: 1px dashed ${ theme.primary100.border };
      }
    ` : `` }

    box-sizing: border-box;
  }

  .mt-editor-container {
    padding: 10px;
    box-sizing: border-box;
  }
`;