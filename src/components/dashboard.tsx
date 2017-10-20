import * as React from 'react';
import { IconButton } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';

type Prop = {
  title: string;
  rightOpen?: boolean;
  leftOpen?: boolean;
  onHome: () => void;
  onLogOut: () => void;
  renderLeft?: () => JSX.Element;
  renderRight?: () => JSX.Element;
}

export class Dashboard extends React.Component<Prop, any> {

  static defaultProps: Partial<Prop> = {
    rightOpen: true,
    leftOpen: true
  }

  constructor() {
    super();
  }

  getGridLayout() {
    if ( this.props.rightOpen && this.props.leftOpen )
      return {
        gridTemplateColumns: 'minmax(100px, 1fr) 1fr 1fr minmax(100px, 1fr)',
        gridTemplateAreas: '"header header header header" "sections main main props"'
      };
    else if ( this.props.leftOpen )
      return {
        gridTemplateColumns: 'minmax(100px, 1fr) 1fr 1fr',
        gridTemplateAreas: '"header header header" "sections main main"'
      };
    else if ( this.props.rightOpen )
      return {
        gridTemplateColumns: '1fr 1fr minmax(100px, 1fr)',
        gridTemplateAreas: '"header header header" "main main props"'
      };
    else
      return {
        gridTemplateColumns: '1fr',
        gridTemplateAreas: '"header" "main"'
      };
  }

  render() {
    return (
      <DashboardOuter
        className="mt-dashboard"
        style={this.getGridLayout()}
      >
        <Head>
          <IconButton
            className="mt-logout"
            style={{ color: 'inherit', margin: '5px', float: 'right' }}
            iconStyle={{ color: 'inherit' }}
            onClick={e => this.props.onLogOut()}
            iconClassName="icon-sign-out"
          />
          <IconButton
            style={{ color: 'inherit' }}
            iconStyle={{ color: 'inherit', fontSize: '30px', lineHeight: '30px' }}
            onClick={e => this.props.onHome()}
            iconClassName="icon-mantle-solid"
          />
          <h1>{this.props.title}</h1>
        </Head>
        {this.props.leftOpen ? <Menu>{this.props.renderLeft && this.props.renderLeft()}</Menu> : undefined}

        <Content>
          {this.props.children}
        </Content>
        {this.props.rightOpen ? <Properties>{this.props.renderRight && this.props.renderRight()}</Properties> : undefined}

      </DashboardOuter>
    )
  }
}

const DashboardOuter = styled.div`
  display: grid;
  grid-template-rows: 60px 1fr;
  height: 100%;
`;

const Head = styled.div`
  background: ${theme.primary200.background };
  color: ${theme.primary200.color };
  border-bottom: 1px solid ${theme.primary200.border! };
  box-sizing: border-box;
  grid-area: header;

  > * {
    display: inline-block;
    vertical-align: middle;
  }

  > h1 {
    margin: 9px 0 0 0;
    font-weight: 300;
  }
`;

const Menu = styled.div`
  grid-area: sections;
  background: ${theme.light100.background };
  border-right: 1px solid ${theme.light100.border! };
  overflow: auto;

  > div > div .selected {
    color: ${ theme.secondary200.color } !important;
    background: ${ theme.secondary200.background } !important;
  }

  > div > div .selected::before {
    content: '';
    position: absolute;
    height: 100%;
    box-sizing: border-box;
    border-left: 8px solid ${ theme.secondary100.background };
  }
`;

const Properties = styled.div`
  grid-area: props;
`;

const Content = styled.div`
  grid-area: main;
  overflow: auto;
  padding: 0 10px;
  box-sizing: border-box;
  box-shadow: 0px 1px 10px 1px rgba(0,0,0,0.2) inset;
  background: ${ theme.light200.background } !important;
`;