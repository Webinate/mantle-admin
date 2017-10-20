import * as React from 'react';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';

type Prop = {
  rightOpen?: boolean;
  leftOpen?: boolean;
  renderLeft?: () => JSX.Element;
  renderRight?: () => JSX.Element;
}

export class Stage extends React.Component<Prop, any> {

  static defaultProps: Partial<Prop> = {
    rightOpen: true,
    leftOpen: true
  }

  constructor() {
    super();
  }

  getStageStyle() {
    if ( this.props.leftOpen && this.props.rightOpen )
      return { width: '50%' };
    else if ( !this.props.leftOpen && this.props.rightOpen ||
      !this.props.rightOpen && this.props.leftOpen )
      return { width: '75%' };
    else
      return { width: '' };
  }

  render() {
    let left: JSX.Element | undefined;
    let right: JSX.Element | undefined;

    if ( this.props.leftOpen ) {
      left = (
        <LeftCurtain>
          {this.props.renderLeft && this.props.renderLeft()}
        </LeftCurtain>
      );
    }

    if ( this.props.rightOpen ) {
      right = (
        <RightCurtain>
          {this.props.renderRight && this.props.renderRight()}
        </RightCurtain>
      );
    }

    return (
      <Container className="mt-curtain">
        {left}
        <Content style={this.getStageStyle()}>
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
  width: 25%;
  height: 100%;
  float: left;
  background: ${theme.light100.background };
  border-right: 1px solid ${theme.light100.border! };
  overflow: auto;
  box-sizing: border-box;
`;

const RightCurtain = styled.div`
  width: 25%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
  background: ${theme.light100.background };
  border-left: 1px solid ${theme.light100.border! };
`;

const Content = styled.div`
  width: 50%;
  height: 100%;
  float: left;
  overflow: auto;
  box-sizing: border-box;
  box-shadow: 0px 1px 10px 1px rgba(0,0,0,0.2) inset;
  background: ${ theme.light200.background } !important;
`;