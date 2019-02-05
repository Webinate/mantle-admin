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
import { generateAvatarPic } from '../utils/component-utils';
import { IUserEntry } from '../../../../src';

type Props = {
  activeUser: IUserEntry<'client' | 'expanded'>;
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
    const headerHeight = 50;

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
                style={{ background: theme.primary300.background, height: '36px', width: '36px' }}
                src={generateAvatarPic( this.props.activeUser )}
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
                    <Icon className="icon icon-settings" />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </MenuItem>

                <MenuItem
                  className="mt-logout"
                  onClick={e => this.props.onLogOut()}
                >
                  <ListItemIcon>
                    <Icon className="icon icon-exit" />
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
        <div
          className="mt-dash-content"
          style={{ height: `calc(100% - ${ headerHeight }px)` }}
        >
          <div className="mt-left-menu">
            <Menu>{this.props.renderLeft && this.props.renderLeft()}</Menu>
          </div>
          <div>
            {this.props.children}
          </div>
        </div>
      </DashboardOuter>
    )
  }
}

const DashboardOuter = styled.div`
  height: 100%;

  .mt-left-menu {
    box-shadow: 0px 5px 10px 1px rgba(0,0,0,0.2);
    position: relative;
    z-index: 1;
    max-width: 225px;
    min-width: 200px;
  }

  .mt-dash-content {
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    display: flex;
    background: ${ theme.light200.background } !important;

    > div {
      flex: 1;
    }
  }
`;

const Head = styled.div`
  background: ${theme.primary200.background };
  color: ${theme.primary200.color };
  border-bottom: 1px solid ${theme.primary200.border! };
  box-sizing: border-box;

  > * {
    display: inline-block;
    vertical-align: middle;
  }

  > h1 {
    margin: 3px 0 0 0;
    font-weight: 300;
  }

  .mt-right-menu {
    float: right;
    color: inherit;
    margin: 6px 10px 0 0;
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