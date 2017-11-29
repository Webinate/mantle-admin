
import * as React from 'react';
import { default as styled } from '../theme/styled';

export interface ISplitPanelProps {
  first?: () => JSX.Element;
  second?: () => JSX.Element;
  orientation?: 'vertical' | 'horizontal';
  ratio?: number;
  dividerSize?: number;
  onRatioChanged?: ( ratio: number ) => void;
  style?: React.CSSProperties;
}

export interface ISplitPanelState {
  ratio?: number;
  dragging?: boolean;
}

interface PanelProps extends React.HTMLProps<HTMLDivElement> {
  isVertical: boolean;
  width: string;
  height: string;
}

/**
* A Component that holds 2 sub Components and a splitter to split between them.
*/
export class SplitPanel extends React.Component<ISplitPanelProps, ISplitPanelState> {

  static defaultProps: ISplitPanelProps = {
    orientation: 'vertical',
    ratio: 0.5,
    dividerSize: 6
  }

  private _mouseUpProxy: any;
  private _mouseMoveProxy: any;
  private _scrubber: HTMLDivElement | null;

  /**
   * Creates a new instance
   */
  constructor( props: ISplitPanelProps ) {
    super( props );
    // Proxies
    this._mouseUpProxy = this.onStageMouseUp.bind( this );
    this._mouseMoveProxy = this.onStageMouseMove.bind( this );
    this._scrubber = null;

    this.state = {
      dragging: false,
      ratio: props.ratio
    };
  }

  /**
   * Called when the props are updated
   */
  componentWillReceiveProps( nextProps: ISplitPanelProps ) {
    this.setState( {
      ratio: ( nextProps.ratio !== this.props.ratio ? nextProps.ratio : this.state.ratio )
    } );
  }

  /**
   * Creates the component elements
   */
  render(): JSX.Element {
    let orientation = this.props.orientation;
    let panel1Style: { width: string; height: string; };
    let panel2Style: { width: string; height: string; };
    let dividerStyle: { width: string; height: string; };
    let dividerSize = this.props.dividerSize!;
    let dividerSizeHalf = dividerSize * 0.5;
    let ratio = this.state.ratio!;

    // Calculate ratios etc...
    if ( orientation === 'vertical' ) {
      panel1Style = {
        width: `calc(${ ratio * 100 }% - ${ dividerSizeHalf }px)`,
        height: '100%'
      };
      dividerStyle = {
        width: dividerSize + 'px',
        height: '100%'
      };
      panel2Style = {
        width: `calc(${ ( 1 - ratio ) * 100 }% - ${ dividerSizeHalf }px)`,
        height: '100%'
      };
    }
    else {
      panel1Style = {
        height: `calc(${ ratio * 100 }% - ${ dividerSizeHalf }px)`,
        width: '100%'
      };
      dividerStyle = {
        height: dividerSize + 'px',
        width: '100%'
      };
      panel2Style = {
        height: `calc(${ ( 1 - ratio ) * 100 }% - ${ dividerSizeHalf }px)`,
        width: '100%'
      };
    }

    const first = this.props.first ? this.props.first() : null;
    const second = this.props.second ? this.props.second() : null;
    const isVertical = orientation === 'vertical' ? true : false;

    return <SplitPanelOuter style={this.props.style}>
      <FirstPanel
        style={panel1Style}
        isVertical={isVertical}
        width={panel1Style.width}
        height={panel1Style.height}
      >
        {this.state.dragging ? <PanelInput /> : null}
        {first}
      </FirstPanel>
      <SplitPanelDivider
        width={dividerStyle.width}
        height={dividerStyle.height}
        isVertical={isVertical}
        onMouseDown={( e ) => { this.onDividerMouseDown( e ) }}
        style={dividerStyle}
      />
      <SplitPanelDividerDragging
        innerRef={elm => this._scrubber = elm}
        style={{
          display: ( !this.state.dragging ? 'none' : '' )
        }} />
      <SecondPanel
        style={panel2Style}
        isVertical={isVertical}
        width={panel2Style.width}
        height={panel2Style.height}
      >
        {this.state.dragging ? <PanelInput /> : null}
        {second}
      </SecondPanel>
      <div className="fix"></div>
    </SplitPanelOuter>
  }

  /**
    * This function is called when the mouse is down on the divider
    */
  private onDividerMouseDown( e: React.MouseEvent<HTMLDivElement> ) {
    e.preventDefault();
    this.setState( { dragging: true } );
    let ratio = this.state.ratio!;
    let orientation = this.props.orientation;
    let scrubber = this._scrubber!;
    let dividerSizeHalf = this.props.dividerSize! * 0.5;
    const isVertical = orientation === 'vertical' ? true : false;

    scrubber.style.height = ( isVertical ? '100%' : this.props.dividerSize + 'px' );
    scrubber.style.width = ( isVertical ? this.props.dividerSize + 'px' : '100%' );
    scrubber.style.left = ( isVertical ? `calc(${ ratio * 100 }% - ${ dividerSizeHalf }px)` : `0` );
    scrubber.style.top = ( isVertical ? `0` : `calc(${ ratio * 100 }% - ${ dividerSizeHalf }px)` );

    window.addEventListener( 'mouseup', this._mouseUpProxy );
    document.body.addEventListener( 'mousemove', this._mouseMoveProxy );
  }

  /**
   * Recalculate the ratios on mouse up
   */
  private onStageMouseUp(): void {

    window.removeEventListener( 'mouseup', this._mouseUpProxy );
    document.body.removeEventListener( 'mousemove', this._mouseMoveProxy );

    let orientation = this.props.orientation;
    let scrubber = this._scrubber!;

    // Get the new ratio
    let left = parseFloat( scrubber.style.left!.split( 'px' )[ 0 ] );
    let top = parseFloat( scrubber.style.top!.split( 'px' )[ 0 ] );
    let w = scrubber.parentElement!.clientWidth;
    let h = scrubber.parentElement!.clientHeight;
    let ratio = 0;

    if ( orientation === 'vertical' )
      ratio = left / w;
    else
      ratio = top / h;

    if ( ratio < 0 )
      ratio = 0;
    if ( ratio > 1 )
      ratio = 1;

    this.setState( {
      ratio: ratio,
      dragging: false
    } );

    if ( this.props.onRatioChanged )
      this.props.onRatioChanged( ratio );
  }

  /**
   * This function is called when the mouse is up from the body of stage.
   */
  private onStageMouseMove( e: MouseEvent ) {
    let orientation = this.props.orientation;
    let scrubber = this._scrubber!;
    let bounds = scrubber.parentElement!.getBoundingClientRect();
    let left = e.clientX - bounds.left;
    let top = e.clientY - bounds.top;

    scrubber.style.left = ( orientation === 'vertical' ? `${ left }px` : `0` );
    scrubber.style.top = ( orientation === 'horizontal' ? `${ top }px` : `0` );
  }

  /**
   * Call this function to get the ratio of the panel. Values are from 0 to 1
   */
  get ratio(): number {
    return this.state.ratio!;
  }

  /**
   * Call this function to set the ratio of the panel. Values are from 0 to 1.
   * @param val The ratio from 0 to 1 of where the divider should be
   */
  set ratio( val: number ) {
    if ( val > 1 )
      val = 1;
    else if ( val < 0 )
      val = 0;

    this.setState( { ratio: val } );
  }
}

const SplitPanelOuter = styled.div`
  position:relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const SplitPanelDivider = styled.div`
  cursor:pointer;
  width: ${ ( props: PanelProps ) => props.width };
  height: ${ ( props: PanelProps ) => props.height };
  float: ${ ( props: PanelProps ) => props.isVertical ? 'left' : '' };
  background: red;
`;

const FirstPanel = styled.div`
  overflow:auto;
  width: ${ ( props: PanelProps ) => props.width };
  height: ${ ( props: PanelProps ) => props.height };
  float: ${ ( props: PanelProps ) => props.isVertical ? 'left' : '' };
`;

const SecondPanel = styled.div`
  overflow:auto;
  width: ${ ( props: PanelProps ) => props.width };
  height: ${ ( props: PanelProps ) => props.height };
  float: ${ ( props: PanelProps ) => props.isVertical ? 'left' : '' };
`;

const PanelInput = styled.div`
  width:100%;
  height:100%;
  z-index:2;
  position: absolute;
`;

const SplitPanelDividerDragging = styled.div`
  position:absolute;
  background-color: rgba( 102, 165, 237, 0.5 );
  cursor:pointer;
`;