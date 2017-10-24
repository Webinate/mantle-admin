import * as React from 'react';
import { default as styled } from '../theme/styled';

type Prop = {
  title: string;
  style?: React.CSSProperties;
  renderSubHeader?: () => JSX.Element;
}

export class ContentHeader extends React.Component<Prop, any> {

  constructor() {
    super();
  }

  render() {
    return (
      <Container style={this.props.style} className="mt-content-header">
        <Header>
          <h2>{this.props.title}</h2>
        </Header>
        <SubHeader>
          {this.props.renderSubHeader ? this.props.renderSubHeader() : undefined}
        </SubHeader>
      </Container>
    )
  }
}

const Container = styled.div`
  box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.3);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  background: #fff;
  height: 100px;
`;

const Header = styled.div`
  overflow: hidden;
  padding: 0 20px;
`;

const SubHeader = styled.div`
  height: 50px;
`;