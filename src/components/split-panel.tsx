import * as React from 'react';
import { default as styled } from '../theme/styled';

export interface ISplitPanelProps {
  first: () => JSX.Element | undefined | null;
  second: () => JSX.Element | undefined | null;
  collapsed?: 'none' | 'left' | 'right';
  orientation?: 'vertical' | 'horizontal';
  ratio?: number;
  dividerSize?: number;
  onRatioChanged?: (ratio: number) => void;
  delay?: number;
  style?: React.CSSProperties;
  resizable?: boolean;
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
}

export interface ISplitPanelState {
  ratio?: number;
  dragging?: boolean;
  animating: boolean;
}

interface PanelProps extends React.HTMLProps<HTMLDivElement> {
  isVertical: boolean;
  delay: number;
  width: string;
  height: string;
  resizable?: boolean;
}

/**
 * A Component that holds 2 sub Components and a splitter to split between them.
 */
export default class SplitPanel extends React.Component<ISplitPanelProps, ISplitPanelState> {
  static defaultProps: Partial<ISplitPanelProps> = {
    orientation: 'vertical',
    ratio: 0.5,
    dividerSize: 6,
    collapsed: 'none',
    delay: 0.5,
    resizable: true,
  };

  private _mouseUpProxy: any;
  private _mouseMoveProxy: any;
  private _scrubber: React.RefObject<HTMLDivElement> | null;
  private _timer: number;

  /**
   * Creates a new instance
   */
  constructor(props: ISplitPanelProps) {
    super(props);
    // Proxies
    this._scrubber = React.createRef();
    this._mouseUpProxy = this.onStageMouseUp.bind(this);
    this._mouseMoveProxy = this.onStageMouseMove.bind(this);

    let ratio = props.ratio;
    if (props.collapsed === 'left') ratio = 0;
    else if (props.collapsed === 'right') ratio = 1;

    this.state = {
      dragging: false,
      ratio: ratio,
      animating: false,
    };
  }

  /**
   * Called when the props are updated
   */
  componentWillReceiveProps(nextProps: ISplitPanelProps) {
    let ratio = nextProps.ratio;

    if (nextProps.collapsed !== this.props.collapsed) {
      if (nextProps.collapsed === 'left') ratio = 0;
      else if (nextProps.collapsed === 'right') ratio = 1;

      // if ( ratio !== this.state.ratio && nextProps.collapsed === 'none' ) {

      if (this._timer) window.clearTimeout(this._timer);

      if (this.props.delay)
        this._timer = window.setTimeout(() => this.setState({ animating: false }), this.props.delay * 1000);

      this.setState({
        ratio: ratio,
        animating: this.props.delay ? true : false,
      });
    }
  }

  /**
   * Creates the component elements
   */
  render(): JSX.Element {
    let orientation = this.props.orientation;
    let panel1Style: React.CSSProperties;
    let panel2Style: React.CSSProperties;
    let dividerStyle: { width: string; height: string };
    let dividerSize = this.props.dividerSize!;
    let dividerSizeHalf = dividerSize * 0.5;
    let ratio = this.state.ratio!;

    // Calculate ratios etc...
    if (orientation === 'vertical') {
      panel1Style = Object.assign({}, this.props.leftStyle, {
        width: `calc( ${ratio * 100}% - ${dividerSizeHalf}px) `,
        height: '100%',
      });
      dividerStyle = {
        width: dividerSize + 'px',
        height: '100%',
      };
      panel2Style = Object.assign({}, this.props.rightStyle, {
        width: `calc( ${(1 - ratio) * 100}% - ${dividerSizeHalf}px)`,
        height: '100%',
      });
    } else {
      panel1Style = Object.assign({}, this.props.leftStyle, {
        height: `calc( ${ratio * 100}% - ${dividerSizeHalf}px) `,
        width: '100%',
      });
      dividerStyle = {
        height: dividerSize + 'px',
        width: '100%',
      };
      panel2Style = Object.assign({}, this.props.rightStyle, {
        height: `calc( ${(1 - ratio) * 100}% - ${dividerSizeHalf}px) `,
        width: '100%',
      });
    }

    const first = this.props.first ? this.props.first() : null;
    const second = this.props.second ? this.props.second() : null;
    const isVertical = orientation === 'vertical' ? true : false;

    return (
      <SplitPanelOuter style={this.props.style}>
        {this.state.animating || this.state.ratio !== 0 ? (
          <FirstPanel
            style={panel1Style}
            delay={this.props.delay!}
            isVertical={isVertical}
            width={panel1Style.width as string}
            height={panel1Style.height as string}
          >
            {this.state.dragging ? <PanelInput /> : null}
            {first}
          </FirstPanel>
        ) : undefined}
        <SplitPanelDivider
          width={dividerStyle.width}
          delay={this.props.delay!}
          height={dividerStyle.height}
          isVertical={isVertical}
          resizable={this.props.resizable}
          onMouseDown={
            this.props.resizable
              ? (e) => {
                  this.onDividerMouseDown(e);
                }
              : undefined
          }
          style={dividerStyle}
        />
        {this.props.resizable ? (
          <SplitPanelDividerDragging
            ref={this._scrubber}
            style={{
              display: !this.state.dragging ? 'none' : '',
            }}
          />
        ) : undefined}
        {this.state.animating || this.state.ratio !== 1 ? (
          <SecondPanel
            style={panel2Style}
            delay={this.props.delay!}
            isVertical={isVertical}
            width={panel2Style.width as string}
            height={panel2Style.height as string}
          >
            {this.state.dragging ? <PanelInput /> : null}
            {second}
          </SecondPanel>
        ) : undefined}

        <div className="fix" />
      </SplitPanelOuter>
    );
  }

  /**
   * This function is called when the mouse is down on the divider
   */
  private onDividerMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    this.setState({ dragging: true });
    let ratio = this.state.ratio!;
    let orientation = this.props.orientation;
    let scrubber = this._scrubber!;
    let dividerSizeHalf = this.props.dividerSize! * 0.5;
    const isVertical = orientation === 'vertical' ? true : false;

    scrubber.current!.style.height = isVertical ? '100%' : this.props.dividerSize + 'px';
    scrubber.current!.style.width = isVertical ? this.props.dividerSize + 'px' : '100%';
    scrubber.current!.style.left = isVertical ? `calc( ${ratio * 100}% - ${dividerSizeHalf}px) ` : `0`;
    scrubber.current!.style.top = isVertical ? `0` : `calc( ${ratio * 100}% - ${dividerSizeHalf}px) `;

    window.addEventListener('mouseup', this._mouseUpProxy);
    document.body.addEventListener('mousemove', this._mouseMoveProxy);
  }

  /**
   * Recalculate the ratios on mouse up
   */
  private onStageMouseUp(): void {
    window.removeEventListener('mouseup', this._mouseUpProxy);
    document.body.removeEventListener('mousemove', this._mouseMoveProxy);

    let orientation = this.props.orientation;
    let scrubber = this._scrubber!;

    // Get the new ratio
    let left = parseFloat(scrubber.current!.style.left!.split('px')[0]);
    let top = parseFloat(scrubber.current!.style.top!.split('px')[0]);
    let w = scrubber.current!.parentElement!.clientWidth;
    let h = scrubber.current!.parentElement!.clientHeight;
    let ratio = 0;

    if (orientation === 'vertical') ratio = left / w;
    else ratio = top / h;

    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;

    this.setState({
      ratio: ratio,
      dragging: false,
    });

    if (this.props.onRatioChanged) this.props.onRatioChanged(ratio);
  }

  /**
   * This function is called when the mouse is up from the body of stage.
   */
  private onStageMouseMove(e: MouseEvent) {
    let orientation = this.props.orientation;
    let scrubber = this._scrubber!;
    let bounds = scrubber.current!.parentElement!.getBoundingClientRect();
    let left = e.clientX - bounds.left;
    let top = e.clientY - bounds.top;

    scrubber.current!.style.left = orientation === 'vertical' ? `${left}px` : `0`;
    scrubber.current!.style.top = orientation === 'horizontal' ? `${top}px` : `0`;
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
  set ratio(val: number) {
    if (val > 1) val = 1;
    else if (val < 0) val = 0;

    this.setState({ ratio: val });
  }
}

const SplitPanelOuter = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
`;

const SplitPanelDivider = styled.div`
  cursor: ${(props: PanelProps) => (props.resizable ? 'pointer' : '')};
  width: ${(props: PanelProps) => props.width};
  height: ${(props: PanelProps) => props.height};
  ${(props: PanelProps) => (props.isVertical ? 'display: inline-block;' : '')};
  background: transparent;
`;

const FirstPanel = styled.div`
  overflow: auto;
  transition: ${(props: PanelProps) => (props.delay ? `${props.delay}s width, ${props.delay}s height;` : '')};
  width: ${(props: PanelProps) => props.width};
  height: ${(props: PanelProps) => props.height};
  ${(props: PanelProps) => (props.isVertical ? 'display: inline-block;' : '')};
`;

const SecondPanel = styled.div`
  overflow: auto;
  transition: ${(props: PanelProps) => (props.delay ? `${props.delay}s width, ${props.delay}s height;` : '')};
  width: ${(props: PanelProps) => props.width};
  height: ${(props: PanelProps) => props.height};
  ${(props: PanelProps) => (props.isVertical ? 'display: inline-block;' : '')};
`;

const PanelInput = styled.div`
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
`;

const SplitPanelDividerDragging = styled.div`
  position: absolute;
  background-color: rgba(102, 165, 237, 0.5);
  cursor: pointer;
  z-index: 1;
`;
