import * as React from 'react';
import { default as styled } from '../theme/styled';

type Props = {
}

type State = {
  sourceMode: boolean;
  activeCommands: string[];
}

export default class RichTextEditor extends React.Component<Props, State> {
  private _editor: HTMLDivElement | null;
  private _source: HTMLPreElement | null;
  private _observer: MutationObserver | null;
  private _commands: { label: string; command: string; value?: string; }[];
  private onSelectionChangeProxy: any;

  constructor( props: Props ) {
    super( props );
    this._commands = [
      { label: 'b', command: 'bold', value: 'bold' },
      { label: 'i', command: 'italic' },
      { label: 'u', command: 'underline' }
    ];
    this.state = {
      sourceMode: false,
      activeCommands: []
    }

    this.onSelectionChangeProxy = this.onSelectionChange.bind( this );
  }

  toggleSource() {
    if ( !this.state.sourceMode ) {
      this._source!.textContent = this._editor!.innerHTML;
      this.setState( { sourceMode: true } );
    }
    else {
      this._editor!.innerHTML = this._source!.textContent!;
      this.setState( { sourceMode: false } );
    }
  }

  formatDoc( event: React.MouseEvent<HTMLElement>, command: string, value?: string ) {
    this._editor!.focus();
    event.preventDefault();
    event.stopPropagation();
    document.execCommand( command, false, value );
  }

  private onEditorChange( e: MutationRecord[] ) {

  }

  private onSelectionChange( e: Event ) {
    const activeCommands: string[] = [];
    let p: Node | null = document.activeElement;
    let withinEditor = false;

    while ( p ) {
      if ( p === this._editor ) {
        withinEditor = true;
        break;
      }

      p = p.parentNode;
    }

    if ( !withinEditor )
      return;

    for ( const c of this._commands )
      if ( document.queryCommandState( c.command ) )
        activeCommands.push( c.command );

    this.setState( { activeCommands } )
  }

  initEditor( elm: HTMLDivElement | null ) {

    if ( this._observer )
      this._observer.disconnect();

    if ( elm ) {
      document.execCommand( 'insertBrOnReturn', false, 'false' )
      document.execCommand( 'defaultParagraphSeparator', false, 'div' );
      document.addEventListener( 'selectionchange', this.onSelectionChangeProxy );
      this._observer = new MutationObserver( e => this.onEditorChange( e ) );
      this._observer.observe( elm, { attributes: true, childList: true, subtree: true } );
    }
    else if ( this._editor ) {
      document.removeEventListener( 'selectionchange', this.onSelectionChangeProxy );
    }

    this._editor = elm;
  }

  render() {
    return (
      <SlugContainer>
        <div>
          {this._commands.map( c => <Button
            style={{ fontWeight: this.state.activeCommands.includes( c.command ) ? 'bold' : undefined }}
            onMouseDown={e => this.formatDoc( e, c.command, c.value )}
            key={c.command}>{c.label}</Button>
          )}
          <input
            type="checkbox"
            name="switchMode"
            id="mt-source-check"
            onChange={e => this.toggleSource()}
            checked={this.state.sourceMode}
          />
          <label htmlFor="mt-source-check">Show HTML</label>
        </div>
        <div>
          <Editor
            innerRef={e => this.initEditor( e )}
            contentEditable={true}
            style={{ display: this.state.sourceMode ? 'none' : undefined }}
          />
          <pre
            ref={e => this._source = e}
            contentEditable={true}
            style={{ display: !this.state.sourceMode ? 'none' : undefined, minHeight: '30px' }}
          />
        </div>
      </SlugContainer>
    );
  }
}

const SlugContainer = styled.div`

`;

const Editor = styled.div`
  min-height: 30px;
  background: #fff;
`;

const Button = styled.div`
  margin: 0 5px 0 0;
  cursor: pointer;
  padding: 5px;
  display: inline-block;
`;