import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import EditorToolbar from './editor-toolbar';
import { IDraftElement } from 'modepress';
import { InlineType } from '../draft/draft-toolbar';

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

  private updateElmHtml( elm: IDraftElement<'client'>, html: string, createParagraph: boolean ) {
    if ( elm.html !== html ) {
      this.clean( this._activeElm );
      const first = this._activeElm.firstElementChild as HTMLElement;
      const firstInnerChild = first.children[ 0 ];
      const lastInnerChild = first.children[ first.children.length - 1 ];
      if ( firstInnerChild instanceof HTMLBRElement )
        first.removeChild( firstInnerChild );
      if ( lastInnerChild instanceof HTMLBRElement )
        first.removeChild( lastInnerChild );


      this.props.onUpdateElm( elm._id, html, createParagraph );
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

  private editElm( elm: IDraftElement<'client'> ) {
    this.setState( {
      activeElm: elm._id
    } );
  }

  private toggleInline( inline: InlineType ) {
    document.execCommand( inline.type.toLowerCase() );
  }

  private focus( elm: HTMLElement ) {
    this._activeElm = elm;
    const firstElm = elm.firstElementChild as HTMLElement;
    if ( firstElm.children.length === 0 )
      firstElm.appendChild( document.createElement( 'br' ) );

    firstElm.focus();
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

                      this.focus( e );
                    }}
                    onBlur={e => this.updateElmHtml( elm, e.currentTarget.innerHTML, false )}
                    className={`mt-element active`}
                    dangerouslySetInnerHTML={{ __html: elm.html || '<p></p>' }}
                    contentEditable={true}
                  />
                );

              return <div
                key={elm._id}
                className="mt-element"
                onClick={e => this.editElm( elm )}
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