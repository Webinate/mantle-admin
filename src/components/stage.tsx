import * as React from 'react';
import { default as styled } from '../theme/styled';

type Prop = {
  style?: React.CSSProperties;
  rightOpen?: boolean;
  leftOpen?: boolean;
  leftSize?: number;
  rightSize?: number;
  renderLeft?: () => JSX.Element | undefined | null;
  renderRight?: () => JSX.Element | undefined | null;
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
  animated?: boolean;
  delay?: number;
};

type State = {
  renderLeft: boolean;
  renderRight: boolean;
  animateLeft: boolean;
  animateRight: boolean;
  leftOpening: boolean;
  rightOpening: boolean;
};

interface CurtainProps extends React.HTMLProps<HTMLDivElement> {
  delay: number;
  size: number;
}

/**
 * A component that divides a div into 3 columns that can be dynamically opened and closed
 */
export default class Stage extends React.Component<Prop, State> {
  static defaultProps: Partial<Prop> = {
    rightOpen: true,
    leftOpen: true,
    animated: true,
    delay: 0.5,
    leftSize: 15,
    rightSize: 25,
  };

  private _shouldAnimateLeft: boolean;
  private _shouldAnimateRight: boolean;
  private _animationTimeout: number;
  private _leftTimeout: number;
  private _rightTimeout: number;

  constructor(props: Prop) {
    super(props);
    this._shouldAnimateLeft = false;
    this._shouldAnimateRight = false;

    this.state = {
      renderLeft: props.leftOpen!,
      renderRight: props.rightOpen!,
      animateLeft: false,
      animateRight: false,
      leftOpening: false,
      rightOpening: false,
    };
  }

  componentWillReceiveProps(next: Prop) {
    if (!this.props.animated) {
      this.setState({
        renderLeft: next.leftOpen!,
        renderRight: next.rightOpen!,
      });
      return;
    }

    if (this.props.leftOpen !== next.leftOpen) {
      this._shouldAnimateLeft = true;
      this.setState({ renderLeft: true });
    } else this._shouldAnimateLeft = false;

    if (this.props.rightOpen !== next.rightOpen) {
      this._shouldAnimateRight = true;
      this.setState({ renderRight: true });
    } else this._shouldAnimateRight = false;

    if (this._shouldAnimateRight || this._shouldAnimateLeft) {
      this.setState({
        animateLeft: this._shouldAnimateLeft,
        animateRight: this._shouldAnimateRight,
        leftOpening: next.leftOpen!,
        rightOpening: next.rightOpen!,
      });

      if (this._animationTimeout) clearTimeout(this._animationTimeout);

      this._animationTimeout = window.setTimeout(() => {
        this.setState({
          animateLeft: false,
          animateRight: false,
          renderLeft: next.leftOpen!,
          renderRight: next.rightOpen!,
        });
      }, this.props.delay! * 1000);
    }
  }

  render() {
    let left: JSX.Element | undefined;
    let right: JSX.Element | undefined;
    let contentSize = 100;

    if (this.state.renderLeft) {
      contentSize -= this.props.leftSize!;

      left = (
        <LeftCurtain
          size={this.props.leftSize!}
          delay={this.props.delay!}
          style={this.props.leftStyle}
          ref={
            this.props.animated
              ? (e: HTMLDivElement) => {
                  if (!e || !this.state.animateLeft) return;

                  if (this._leftTimeout) clearTimeout(this._leftTimeout);

                  if (this.state.leftOpening) {
                    e.style.width = `0`;
                    this._leftTimeout = window.setTimeout(() => {
                      e.style.width = this.props.leftSize!.toString() + '%';
                    }, 30);
                  } else {
                    e.style.width = this.props.leftSize!.toString() + '%';
                    this._leftTimeout = window.setTimeout(() => {
                      e.style.width = '0';
                    }, 30);
                  }
                }
              : undefined
          }
        >
          {this.props.renderLeft && this.props.renderLeft()}
        </LeftCurtain>
      );
    }

    if (this.state.renderRight) {
      contentSize -= this.props.rightSize!;
      right = (
        <RightCurtain
          size={this.props.rightSize!}
          delay={this.props.delay!}
          style={this.props.rightStyle}
          ref={
            this.props.animated
              ? (e: HTMLDivElement) => {
                  if (!e || !this.state.animateRight) return;

                  if (this._rightTimeout) clearTimeout(this._rightTimeout);

                  if (this.state.rightOpening) {
                    e.style.transform = `scale(0, 1)`;
                    this._rightTimeout = window.setTimeout(() => {
                      e.style.transform = 'scale(1, 1)';
                    }, 30);
                  } else {
                    e.style.transform = `scale(1, 1)`;
                    this._rightTimeout = window.setTimeout(() => {
                      e.style.transform = 'scale(0, 1)';
                    }, 30);
                  }
                }
              : undefined
          }
        >
          {this.props.renderRight && this.props.renderRight()}
        </RightCurtain>
      );
    }

    return (
      <Container style={this.props.style} className="mt-curtain">
        {left}
        <Content size={contentSize}>{this.props.children}</Content>
        {right}
      </Container>
    );
  }
}

const Container = styled.div`
  height: 100%;
`;

const LeftCurtain = styled.div`
  width: ${(props: CurtainProps) => props.size}%;
  height: 100%;
  float: left;
  overflow: auto;
  transition: ${(props: CurtainProps) => props.delay!.toString()}s width;
  box-sizing: border-box;
  transform-origin: 0 0;
  overflow: hidden;
`;

const RightCurtain = styled.div`
  width: ${(props: CurtainProps) => props.size}%;
  height: 100%;
  float: left;
  overflow: auto;
  transition: ${(props: CurtainProps) => props.delay!.toString()}s transform;
  box-sizing: border-box;
  transform-origin: 100% 0;
  overflow: hidden;
`;

const Content = styled.div`
  width: ${(props: { size: number }) => props.size}%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
`;
