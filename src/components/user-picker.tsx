import * as React from 'react';
import { User, PaginatedUserResponse } from 'mantle';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import CloseIcon from '@material-ui/icons/Close';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import { graphql } from '../utils/httpClients';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import { GET_USERS } from '../graphql/requests/user-requests';

type Props = {
  user: User | null;
  canEdit?: boolean;
  onChange: (user: User | null) => void;
  labelStyle?: React.CSSProperties;
  labelPosition?: 'right' | 'left';
  imageSize?: number;
};

type State = {
  elm: Element | null;
  open: boolean;
  users: User[];
  username: string;
};

export default class UserPicker extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    canEdit: true,
    labelPosition: 'left',
    imageSize: 40,
  };

  private elm: HTMLElement | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      elm: null,
      open: false,
      users: [],
      username: '',
    };
  }

  async onUpdateInput(user: string) {
    const page = await graphql<{ users: PaginatedUserResponse }>(GET_USERS, { search: user, limit: 10 });
    this.setState({ username: user, users: page.users.data });
  }

  private close() {
    this.setState({ open: false, users: [] });
  }

  private renderPopover() {
    return (
      <Popover
        style={{ padding: 5 }}
        anchorEl={this.elm!}
        open={true}
        onClose={() => {
          this.close();
        }}
      >
        <div style={{ margin: '10px 5px 10px 10px' }}>
          <Input
            autoFocus={true}
            placeholder="Type user name"
            className="mt-user-autocomplete"
            value={this.state.username}
            onChange={(e) => this.onUpdateInput(e.currentTarget.value)}
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              this.props.onChange(null);
              this.setState({ open: false, users: [] });
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <Paper>
          <MenuList>
            {this.state.users.map((user, index) => {
              return (
                <MenuItem
                  className="mt-user-drop-item"
                  key={`user-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.onChange(user);
                    this.setState({ open: false, users: [] });
                  }}
                >
                  <ListItemIcon>
                    <Avatar style={{ background: theme.light400.background }} src={generateAvatarPic(user)} />
                  </ListItemIcon>
                  <ListItemText primary={user.username} />
                </MenuItem>
              );
            })}
          </MenuList>
        </Paper>
      </Popover>
    );
  }

  private renderLabel() {
    return (
      <span className="my-user-picker-label" style={{ verticalAlign: 'middle', ...this.props.labelStyle }}>
        {this.props.user ? this.props.user.username : 'Not set '}
      </span>
    );
  }

  render() {
    return (
      <div
        ref={(e) => (this.elm = e)}
        className="my-user-picker-btn"
        style={{
          display: 'inline-block',
          padding: '0 0 0 5px',
          cursor: this.props.canEdit ? 'pointer' : '',
        }}
        onClick={
          this.props.canEdit
            ? (e) => {
                this.setState({ open: true, elm: e.currentTarget }, () => {
                  this.onUpdateInput('');
                });
              }
            : undefined
        }
      >
        {this.props.labelPosition === 'left' ? this.renderLabel() : undefined}

        <Avatar
          style={{
            display: 'inline-flex',
            verticalAlign: 'middle',
            margin: this.props.labelPosition === 'right' ? '0 5px 0 0' : '0 0 0 5px',
            background: theme.light400.background,
            height: this.props.imageSize,
            width: this.props.imageSize,
          }}
          src={generateAvatarPic(this.props.user)}
        />

        {this.props.labelPosition === 'right' ? this.renderLabel() : undefined}
        {this.state.open ? this.renderPopover() : undefined}
      </div>
    );
  }
}
