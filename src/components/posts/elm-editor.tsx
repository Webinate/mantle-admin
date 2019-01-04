import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import EditorToolbar from './editor-toolbar';
import { IDraftElement, IImageElement, IDocument, ITemplate } from 'modepress';
import { InlineType } from './editor-toolbar';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import { MediaModal } from '../../containers/media-modal';

export type Props = {
  elements: IDraftElement<'client' | 'expanded'>[];
  selected: string[];
  focussedId: string;
  document: IDocument<'client'>;
  onSelectionChanged: ( ids: string[], focus: boolean ) => void;
  onCreateElm: ( type: Partial<IDraftElement<'client' | 'expanded'>>[], index?: number ) => void;
  onDeleteElm: ( ids: string[] ) => void;
  onUpdateElm: ( id: string, html: string, createElement: Partial<IDraftElement<'client' | 'expanded'>> | null, deselect: 'select' | 'deselect' | 'none' ) => void;
}

export type State = {
  initialized: boolean;
  anchorOpen: boolean;
  selectedZone: string;
  linkUrl: string;
  showMediaPopup: boolean;
};

/**
 * The main application entry point
 */
export class ElmEditor extends React.Component<Props, State> {
  private _activeElm: HTMLElement | null;
  private _firstElm: HTMLElement | null;
  private _lastFocussedElm: HTMLElement;
  private _keyProxy: any;
  private _previousSelection: string[];
  private _ranges: Range[] | null;
  private _lastActiveIndex: number;

  constructor( props: Props ) {
    super( props );
    this._keyProxy = this.onWindowKeyDown.bind( this );
    this._ranges = null;
    this._lastActiveIndex = 0;
    this.state = {
      initialized: false,
      anchorOpen: false,
      showMediaPopup: false,
      linkUrl: '',
      selectedZone: ( props.document.template as ITemplate<'client'> ).zones[ 0 ]
    };
  }

  componentWillReceiveProps( next: Props ) {
    const nextTemplate = next.document.template as ITemplate<'client'>;
    if ( next.document !== this.props.document )
      this.setState( { selectedZone: nextTemplate.zones[ 0 ] } );
    if ( this._lastFocussedElm && next.selected.length === 0 && this.props.selected.length > 0 )
      this._lastFocussedElm.classList.remove( 'cursor' );

    const elements = next.elements.map( elm => elm._id );
    const selected = next.selected;
    if ( selected.length > 0 ) {
      const index = elements.indexOf( selected[ 0 ] );
      if ( index !== -1 )
        this._lastActiveIndex = index;
    }
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
    // CTRL + C
    if ( e.ctrlKey && e.keyCode === 67 ) {
      if ( this.props.selected.length > 0 )
        this.copyElementsToLocalStorage( true );
      else
        localStorage.setItem( 'elm-editor-clip', '' );
    }
    // CTRL + x
    else if ( e.ctrlKey && e.keyCode === 88 && this.props.selected.length > 0 ) {
      this.copyElementsToLocalStorage( false );
      this.props.onDeleteElm( this.props.selected );
    }
    // CTRL + V
    else if ( e.ctrlKey && e.keyCode === 86 && this.hasClipboard() ) {
      e.stopPropagation();
      e.preventDefault();
      this.pasteElementsFromLocalStorage();
    }
    // Delete
    if ( e.keyCode === 46 && this.props.focussedId === '' && this.props.selected.length > 0 )
      this.props.onDeleteElm( this.props.selected );
  }

  private getLastLeafNode( source: Node ) {
    if ( source.childNodes.length === 0 )
      return source;

    function getLeafNodeChild( child: Node ): Node {
      if ( child.childNodes.length === 0 )
        return child;

      return getLeafNodeChild( child.childNodes[ child.childNodes.length - 1 ] );
    }

    return getLeafNodeChild( source.childNodes[ source.childNodes.length - 1 ] );
  }

  /**
   * Going backwards, this gets the first editable node
   */
  private getFirstEditable( source: Node ) {
    const voidNodeTags = [ 'AREA', 'BASE', 'BR', 'COL', 'EMBED',
      'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'MENUITEM', 'META',
      'PARAM', 'SOURCE', 'TRACK', 'WBR', 'BASEFONT',
      'BGSOUND', 'FRAME', 'ISINDEX' ];

    // Basic idea from: https://stackoverflow.com/questions/19790442/test-if-an-element-can-contain-text
    function canContainText( node: Node ) {
      if ( node.nodeType === 1 ) // is an element node
        return !voidNodeTags.includes( node.nodeName );
      else  // is not an element node
        return false;
    };

    function getFirstEditableChild( child: Node | null ): Node | null {
      if ( !child )
        return null;

      if ( canContainText( child ) )
        return child;

      return getFirstEditableChild( child.previousSibling || child.parentNode );
    }

    return getFirstEditableChild( source );
  }

  /**
   * Removes empty text nodes
   */
  private clean( node: Node ) {
    for ( let n = 0; n < node.childNodes.length; n++ ) {
      const child = node.childNodes[ n ];
      if ( child.nodeType === 8 || ( child.nodeType === 3 && !/\S/.test( child.nodeValue! ) ) ) {

        // If next node is an element, then dont remove the text as it might
        // be a space between nodes
        if ( n + 1 < node.childNodes.length ) {
          const nextChild = node.childNodes[ n + 1 ];
          if ( nextChild.nodeType !== 8 && nextChild.nodeType !== 3 ) {
            continue;
          }
        }
        else {
          node.removeChild( child );
          n--;
        }
      }
      else if ( child.nodeType === 1 ) {
        this.clean( child );
      }
    }
  }

  private copyElementsToLocalStorage( copy: boolean ) {
    let selectedElms = this.props.elements.filter( e => this.props.selected.includes( e._id ) );
    localStorage.setItem( 'elm-editor-clip', JSON.stringify( selectedElms ) );
  }

  private hasClipboard() {
    const result = localStorage.getItem( 'elm-editor-clip' );
    return result && result !== '' ? true : false;
  }

  private pasteElementsFromLocalStorage() {
    try {
      const selectedElementsJson: Partial<IDraftElement<'client'>>[] = JSON.parse(
        localStorage.getItem( 'elm-editor-clip' )! );

      const refinedElms = selectedElementsJson.map( e => {
        delete e._id;
        delete e.parent;
        e.zone = this.state.selectedZone;
        return e;
      } );

      this.props.onCreateElm( refinedElms );
    }
    catch ( err ) { }
  }

  /**
   * Updates an element and then optionally creates a new paragraph
   * @param elm The element to update
   * @param createElement Should we create a paragraph when done updating
   * @param deselect If true, then nothing should be selected after update
   */
  private updateElmHtml( elm: IDraftElement<'client' | 'expanded'>, createElement: Partial<IDraftElement<'client' | 'expanded'>> | null, deselect: 'select' | 'deselect' | 'none' ) {
    if ( !this._activeElm )
      return;

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
      this.props.onUpdateElm( elm._id, html, createElement, deselect );
    else if ( createElement )
      this.props.onCreateElm( [ { type: 'elm-paragraph', zone: this.state.selectedZone } ] );
    else if ( deselect )
      this.props.onSelectionChanged( [], false );
  }

  /**
   * Focus on the last child element within a node
   */
  private focusLast( el: HTMLElement ) {
    if ( this._lastFocussedElm )
      this._lastFocussedElm.classList.remove( 'cursor' );

    el.focus();
    let firstEditable: Node | null = this.getFirstEditable( this.getLastLeafNode( el ) );

    if ( this._ranges ) {
      this.restoreSelection( this._ranges );
      document.execCommand( 'createLink', false, this.state.linkUrl );
      this._ranges = null;
    }
    else {
      const range = document.createRange();

      if ( firstEditable && firstEditable.childNodes.length > 0 && firstEditable.childNodes[ 0 ].nodeType === 3 ) {
        range.setStart( firstEditable!.childNodes[ 0 ], firstEditable!.childNodes[ 0 ].textContent!.length );
        range.collapse( true );
      }
      else {
        range.selectNodeContents( el );
        range.selectNodeContents( firstEditable || el );
      }

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange( range );
    }

    if ( !this.elementInViewport( el ) )
      el.scrollIntoView();

    el.parentElement!.focus();
    this._lastFocussedElm = el.parentElement!;
    this._lastFocussedElm.classList.add( 'cursor' );
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
  private onElmDown( e: React.MouseEvent<HTMLElement>, elm: IDraftElement<'client' | 'expanded'> ) {
    e.preventDefault();
    e.stopPropagation();

    if ( this.props.focussedId !== '' && elm._id !== this.props.focussedId )
      this.updateElmHtml( this.props.elements.find( e => e._id === this.props.focussedId )!, null, 'none' );

    if ( !e.ctrlKey && !e.shiftKey ) {
      this.props.onSelectionChanged( [ elm._id ], false );
    }
    else if ( e.ctrlKey ) {
      if ( this.props.selected.indexOf( elm._id ) === -1 )
        this.props.onSelectionChanged( this.props.selected.concat( elm._id ), false );
      else
        this.props.onSelectionChanged( this.props.selected.filter( i => i !== elm._id ), false );
    }
    else {
      const elements = this.props.elements.map( elm => elm._id );
      const selected = this.props.selected;

      let firstIndex = Math.min( elements.indexOf( elm._id ), selected.length > 0 ? elements.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( elements.indexOf( elm._id ), selected.length > 0 ? selected.indexOf( selected[ 0 ] ) : 0 );

      this.props.onSelectionChanged( elements.slice( firstIndex, lastIndex + 1 ), false );
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
    const activeElm = this._activeElm!;
    const firstElm = this._firstElm!;

    // Backkspace / Delete
    if ( e.keyCode === 8 || e.keyCode === 46 ) {
      if ( activeElm.children.length === 0 || activeElm.children[ 0 ].tagName !== firstElm.tagName ) {
        this.clear( activeElm );
        this.clear( firstElm );
        this._firstElm = firstElm.cloneNode() as HTMLElement;
        activeElm.append( this._firstElm );
        this.focusLast( this._firstElm );
      }
    }
    // Escape
    if ( e.keyCode === 27 ) {
      const selected = this.getSelectedElement();
      if ( selected )
        this.updateElmHtml( selected, null, 'deselect' );
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
      this.updateElmHtml( selectedElm, { type: 'elm-paragraph', zone: this.state.selectedZone }, 'select' );
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

  private saveSelection() {
    const selection = window.getSelection();
    if ( selection.getRangeAt && selection.rangeCount ) {
      let ranges: Range[] = [];
      for ( let i = 0, len = selection.rangeCount; i < len; ++i ) {
        ranges.push( selection.getRangeAt( i ) );
      }
      return ranges;
    }

    return null;
  }

  private restoreSelection( savedSel: Range[] ) {
    if ( savedSel ) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      for ( let i = 0, len = savedSel.length; i < len; ++i ) {
        selection.addRange( savedSel[ i ] );
      }
    }
  }

  private renderAnchorModal() {
    return <Dialog
      open={this.state.anchorOpen}
      onClose={() => this.setState( { anchorOpen: false } )}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <DialogContentText>
          Enter a URL in the field below
        </DialogContentText>
        <TextField
          autoFocus
          value={this.state.linkUrl}
          onChange={e => this.setState( { linkUrl: e.currentTarget.value } )}
          margin="dense"
          id="mt-link-address"
          placeholder="http://"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={e => {
            this._ranges = null;
            this.setState( { anchorOpen: false } );
          }}
          color="primary"
          id="mt-link-cancel"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!this.state.linkUrl}
          onClick={e => {
            this.setState( { anchorOpen: false }, () => this.props.onSelectionChanged( this._previousSelection, true ) );
          }}
          color="primary"
          id="mt-link-confirm"
        >
          Apply Link
        </Button>
      </DialogActions>
    </Dialog>
  }

  render() {
    if ( !this.state.initialized )
      return <div></div>;

    let elements = this.props.elements;
    const selection = this.props.selected;
    const doc = this.props.document
    const template = doc.template as ITemplate<'client'>;
    const selectedZone = this.state.selectedZone;
    const zones = template.zones.concat( 'unassigned' );
    const unassigned: IDraftElement<'client' | 'expanded'>[] = [];
    const focussedId = this.props.focussedId;

    for ( const elm of elements )
      if ( !zones.includes( elm.zone ) || elm.zone === 'unassigned' )
        unassigned.push( elm );

    if ( selectedZone === 'unassigned' )
      elements = unassigned;
    else
      elements = elements.filter( e => e.zone === selectedZone );

    return (
      <div>
        {zones.map( ( z, index ) => <Tab
          key={`tab-${ index }`}
          onClick={e => {
            this.props.onSelectionChanged( [], false );
            this.setState( { selectedZone: z } )
          }}
          className={`mt-editor-tab ${ selectedZone === z ? 'active' : 'inactive' }`}>{z}
        </Tab> )}
        <Container>
          <EditorToolbar
            onCreateBlock={( type, html ) => this.props.onCreateElm( [ { type, html, zone: this.state.selectedZone } ], this._lastActiveIndex + 1 )}
            onAddMedia={() => this.setState( { showMediaPopup: true } )}
            onLink={() => {
              if ( this.props.selected.length === 0 )
                return;

              this._previousSelection = this.props.selected.slice();
              this._ranges = this.saveSelection();
              this.props.onSelectionChanged( [], false );
              this.setState( { anchorOpen: true, linkUrl: '' } )
            }}
            onDelete={() => this.props.onDeleteElm( this.props.selected )}
            onInlineToggle={styleStyle => this.toggleInline( styleStyle )}
            style={{ margin: '10px' }}
          />

          <div
            className={`mt-editor-container`}
          >
            {elements.map( ( elm, index ) => {

              const isEditable = elm.type !== 'elm-image';

              if ( focussedId === elm._id )
                return (
                  <div
                    key={`elm-${ index }`}
                    ref={e => {
                      if ( !e )
                        return;

                      if ( isEditable )
                        setTimeout( () => this.activateElm( e ), 200 );
                      else {
                        this._activeElm = null;
                        this._firstElm = null;
                      }
                    }}
                    onBlur={e => this.updateElmHtml( elm, null, 'deselect' )}
                    className={`mt-element active focussed`}
                    dangerouslySetInnerHTML={{ __html: elm.html || '<p></p>' }}
                    contentEditable={isEditable}
                    onKeyDown={isEditable ? e => this.onKeyDown( e ) : undefined}
                    onKeyUp={isEditable ? e => this.onKeyUp( e ) : undefined}
                  />
                );

              return <div
                key={`elm-${ index }`}
                className={`mt-element${ selection.includes( elm._id ) ? ' active' : '' }`}
                onMouseDown={e => this.onElmDown( e, elm )}
                onDoubleClick={e => this.props.onSelectionChanged( [ elm._id ], true )}
                dangerouslySetInnerHTML={{ __html: elm.html }}
              />;
            } )}
          </div>
          {this.renderAnchorModal()}
        </Container>

        {this.state.showMediaPopup ?
          <MediaModal
            {...{} as any}
            open={true}
            onCancel={() => { this.setState( { showMediaPopup: false } ) }}
            onSelect={file => this.setState( {
              showMediaPopup: false
            }, () => this.props.onCreateElm( [ {
              type: 'elm-image',
              image: file._id,
              zone: this.state.selectedZone
            } as IImageElement<'client'> ], this._lastActiveIndex + 1 ) )}
          /> : undefined}
      </div>
    );
  }
}

const Tab = styled.div`
  display: inline-block;
  padding: 5px;
  text-transform: capitalize;
  background: ${theme.light100.background };
  border-top: 1px solid ${theme.light100.border };
  border-left: 1px solid ${theme.light100.border };
  border-right: 1px solid ${theme.light100.border };
  position: relative;
  top: 2px;
  margin: 0 4px 0 0;
  cursor: pointer;

  &.inactive {
    background: ${theme.light200.background };
  }
`

const Container = styled.div`
  overflow: auto;
  padding: 0;
  min-height: 300px;
  box-sizing: border-box;
  background: ${theme.light100.background };
  border: 1px solid ${theme.light100.border };
  color: ${theme.light100.color };
  border-radius: 4px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.2),
    0px 1px 1px 0px rgba(0, 0, 0, 0.14),
    0px 2px 1px -1px rgba(0, 0, 0, 0.12);

  b, strong {
    font-weight: bold;
  }

  img {
    max-width:100%;
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
    outline: 0px solid transparent;
    &:hover {
      border: 1px dashed ${ theme.light200.border };
    }

    a {
      text-decoration: underline;
      color: ${theme.primary300.background };
    }

    > * { min-height: 10px; }

    &.focussed {
      user-select: auto;
      border: 1px dashed ${ theme.primary100.border };
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