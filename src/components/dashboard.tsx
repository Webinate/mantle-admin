import * as React from 'react';
import { IconButton } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { Stage } from './stage';

type Prop = {
  title: string;
  onHome: () => void;
  onLogOut: () => void;
  renderLeft?: () => JSX.Element;
  renderRight?: () => JSX.Element;
}

export class Dashboard extends React.Component<Prop, any> {

  constructor() {
    super();
  }

  render() {
    const headerHeight = 60;

    return (
      <DashboardOuter className="mt-dashboard">
        <Head
          style={{ height: `${ headerHeight }px` }}
        >
          <IconButton
            className="mt-logout"
            style={{ color: 'inherit', margin: '5px', float: 'right' }}
            iconStyle={{ color: 'inherit' }}
            onClick={e => this.props.onLogOut()}
            iconClassName="icon-exit_to_app"
          />
          <IconButton
            style={{ color: 'inherit' }}
            iconStyle={{ color: 'inherit', fontSize: '30px', lineHeight: '30px' }}
            onClick={e => this.props.onHome()}
            iconClassName="icon-mantle"
          />
          <h1>{this.props.title}</h1>
        </Head>
        <Stage
          rightOpen={false}
          style={{ height: `calc(100% - ${ headerHeight }px)` }}
          renderLeft={() => <Menu>{this.props.renderLeft && this.props.renderLeft()}</Menu>}
          leftStyle={{ boxShadow: '0px 5px 10px 1px rgba(0,0,0,0.2)', position: 'relative' }}
        >
          <Content>
            {this.props.children}
          </Content>
        </Stage>
      </DashboardOuter>
    )
  }
}

const DashboardOuter = styled.div`
  height: 100%;
`;

const Head = styled.div`
  background: ${theme.secondary100.background };
  color: ${theme.secondary100.color };
  border-bottom: 1px solid ${theme.secondary100.border! };
  box-sizing: border-box;

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
  background: ${theme.light100.background };
  border-right: 1px solid ${theme.light100.border! };
  overflow: auto;
  height: 100%;

  > div > div .selected {
    color: ${ theme.primary100.color } !important;
    background: ${ theme.primary100.background } !important;
  }

  > div > div .selected::before {
    content: '';
    position: absolute;
    height: 100%;
    box-sizing: border-box;
    border-left: 8px solid ${ theme.primary200.background };
  }
`;

const Content = styled.div`
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  background: ${ theme.light200.background } !important;
`;