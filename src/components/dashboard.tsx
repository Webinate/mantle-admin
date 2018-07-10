import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import Stage from './stage';
import { generateAvatarPic } from '../utils/component-utils';
import { IUserEntry } from 'modepress';

type Props = {
  activeUser: IUserEntry<'client'>;
  title: string;
  onHome: () => void;
  onLogOut: () => void;
  renderLeft?: () => JSX.Element;
  renderRight?: () => JSX.Element;
  animated: boolean;
}

type State = {
  open: boolean;
  anchorEl?: HTMLDivElement;
}

export default class Dashboard extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      open: false
    }
  }

  render() {
    const headerHeight = 60;
    const menuItemStyle: React.CSSProperties = {
      color: theme.primary100.background,
      fontSize: '20px'
    };

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
                style={{ background: theme.primary300.background }}
                src={generateAvatarPic( this.props.activeUser.avatar )}
              />
            </div>

            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              transitionDuration={this.props.animated ? 'auto' : 0}
              onClose={() => this.setState( { open: false } )}
            >
              <Menu>
                <MenuItem
                  className="mt-settings"
                >
                  <ListItemIcon>
                    <Icon style={menuItemStyle} className="icon icon-settings" />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>

                <MenuItem
                  className="mt-logout"
                  onClick={e => this.props.onLogOut()}
                >
                  <ListItemIcon>
                    <Icon style={menuItemStyle} className="icon icon-exit" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>

              </Menu>
            </Popover>
          </div>

          <IconButton
            style={{ color: 'inherit' }}
            onClick={e => this.props.onHome()}
          >
            <Icon
              style={{ color: 'inherit', fontSize: '30px', lineHeight: '30px' }}
              className="icon icon-mantle"
            />
          </IconButton>
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
  background: ${theme.secondary200.background };
  color: ${theme.secondary200.color };
  border-bottom: 1px solid ${theme.secondary200.border! };
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

  > nav .selected {
    background: ${ theme.primary100.background };
    color: ${ theme.primary100.color };
  }

  > nav > div.selected::before {
    content: '';
    position: absolute;
    height: 100%;
    box-sizing: border-box;
    border-left: 8px solid ${ theme.primary200.background };
    left: 0;
  }
`;

const Content = styled.div`
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  background: ${ theme.light200.background } !important;
`;