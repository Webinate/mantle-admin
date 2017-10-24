import * as React from 'react';
import { default as styled } from '../theme/styled';

type Prop = {
  style?: React.CSSProperties;
  rightOpen?: boolean;
  leftOpen?: boolean;
  leftPerctage?: number;
  rightPerctage?: number;
  renderLeft?: () => JSX.Element;
  renderRight?: () => JSX.Element;
}

export class Stage extends React.Component<Prop, any> {

  static defaultProps: Partial<Prop> = {
    rightOpen: true,
    leftOpen: true,
    leftPerctage: 15,
    rightPerctage: 25
  }

  constructor() {
    super();
  }

  render() {
    let left: JSX.Element | undefined;
    let right: JSX.Element | undefined;
    let contentSize = 100;

    if ( this.props.leftOpen ) {
      contentSize -= this.props.leftPerctage!;

      left = (
        <LeftCurtain size={this.props.leftPerctage!}>
          {this.props.renderLeft && this.props.renderLeft()}
        </LeftCurtain>
      );
    }

    if ( this.props.rightOpen ) {
      contentSize -= this.props.rightPerctage!;

      right = (
        <RightCurtain size={this.props.rightPerctage!}>
          {this.props.renderRight && this.props.renderRight()}
        </RightCurtain>
      );
    }

    return (
      <Container style={this.props.style} className="mt-curtain">
        {left}
        <Content size={contentSize}>
          {this.props.children}
        </Content>
        {right}
      </Container>
    )
  }
}

const Container = styled.div`
  height: 100%;
`;

const LeftCurtain = styled.div`
  width: ${( props: { size: number; } ) => props.size }%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
  box-shadow: 0px 5px 10px 1px rgba(0,0,0,0.2);
  position: relative;
  z-index: 1;
`;

const RightCurtain = styled.div`
  width: ${( props: { size: number; } ) => props.size }%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
`;

const Content = styled.div`
  width: ${( props: { size: number; } ) => props.size }%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
`;