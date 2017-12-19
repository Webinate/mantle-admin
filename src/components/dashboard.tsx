import * as React from 'react';
import { IconButton, Popover, MenuItem, FontIcon, Avatar } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { Stage } from './stage';
import { generateAvatarPic } from '../utils/component-utils';
import { IUserEntry } from 'modepress';

type Props = {
  activeUser: IUserEntry;
  title: string;
  onHome: () => void;
  onLogOut: () => void;
  renderLeft?: () => JSX.Element;
  renderRight?: () => JSX.Element;
}

type State = {
  open: boolean;
  anchorEl?: HTMLDivElement;
}

export class Dashboard extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      open: false
    }
  }

  render() {
    const headerHeight = 60;
    const menuItemStyle: React.CSSProperties = { color: theme.primary300.background };

    return (
      <DashboardOuter className="mt-dashboard">
        <Head
          style={{ height: `${ headerHeight }px` }}
        >
          <div className="mt-right-menu">
            <h2>{this.props.activeUser.username}</h2>
            <div
              style={{ color: 'inherit', display: 'inline-block', cursor: 'pointer' }}
              className="mt-user-menu"
              onClick={( event ) => {
                this.setState( { open: true, anchorEl: event.currentTarget } )
              }}
            >
              <Avatar
                backgroundColor={theme.primary300.background}
                src={generateAvatarPic( this.props.activeUser.avatar )}
              />
            </div>

            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={() => this.setState( { open: false } )}
            >
              <Menu>
                <MenuItem
                  className="mt-settings"
                  leftIcon={<FontIcon style={menuItemStyle} className="icon icon-settings" />}
                  primaryText="Settings"
                />
                <MenuItem
                  className="mt-logout"
                  leftIcon={<FontIcon style={menuItemStyle} className="icon icon-exit" />}
                  onClick={e => this.props.onLogOut()}
                  primaryText="Logout"
                />
              </Menu>
            </Popover>
          </div>

          <IconButton
            style={{ color: 'inherit' }}
            iconStyle={{ color: 'inherit', fontSize: '30px', lineHeight: '30px' }}
            onClick={e => this.props.onHome()}
            iconClassName="icon icon-mantle"
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

  .mt-right-menu {
    float: right;
    color: inherit;
    margin: 10px 10px 0 0;
    textAlign: right;
  }

  .mt-user-menu {
    vertical-align: middle;
  }

  h2 {
    display: inline-block;
    margin: 0 5px 0 0;
    vertical-align: middle;
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