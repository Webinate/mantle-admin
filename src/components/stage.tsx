import * as React from 'react';
import { default as styled } from '../theme/styled';

type Prop = {
  style?: React.CSSProperties;
  rightOpen?: boolean;
  leftOpen?: boolean;
  leftPerctage?: number;
  rightPerctage?: number;
  renderLeft?: () => JSX.Element | undefined | null;
  renderRight?: () => JSX.Element | undefined | null;
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
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
    React.PureComponent
  }

  render() {
    let left: JSX.Element | undefined;
    let right: JSX.Element | undefined;
    let contentSize = 100;

    if ( this.props.leftOpen ) {
      contentSize -= this.props.leftPerctage!;

      left = (
        <LeftCurtain
          size={this.props.leftPerctage!}
          style={this.props.leftStyle}
        >
          {this.props.renderLeft && this.props.renderLeft()}
        </LeftCurtain>
      );
    }

    if ( this.props.rightOpen ) {
      contentSize -= this.props.rightPerctage!;

      right = (
        <RightCurtain
          size={this.props.rightPerctage!}
          style={this.props.rightStyle}
          innerRef={( e: HTMLDivElement ) => {
            if ( !e )
              return

            e.style.transform = `scale(0, 1)`;
            setTimeout( () => {
              e.style.transform = 'scale(1, 1)';
            }, 30 );
          }}
        >
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
  transition: 0.5s width;
  box-sizing: border-box;
  transform-origin: 100% 0;
`;

const RightCurtain = styled.div`
  width: ${( props: { size: number; } ) => props.size }%;
  height: 100%;
  float: left;
  overflow: auto;
  transition: 0.5s transform;
  box-sizing: border-box;
  transform-origin: 100% 0;
`;

const Content = styled.div`
  width: ${( props: { size: number; } ) => props.size }%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
`;