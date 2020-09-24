import * as React from 'react';
import { User } from 'mantle';
import Avatar from '@material-ui/core/Avatar';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import { format } from 'date-fns';
import { generateAvatarPic } from '../../utils/component-utils';

type Props = {
  users: User[];
  selected: string[];
  onUserSelected: (user: User, e: React.MouseEvent<HTMLDivElement>) => void;
};

interface SCompProps extends React.HTMLProps<HTMLDivElement> {
  selected: boolean;
}

export default class UsersList extends React.Component<Props, any> {
  render() {
    const selectedUsers = this.props.selected;
    let selected = false;
    const users = this.props.users;
    return (
      <div className="mt-user-list">
        {users.map((user, index) => {
          selected = selectedUsers.indexOf(user._id as string) === -1 ? false : true;

          return (
            <UserDiv key={`user-${index}`} selected={selected} onMouseDown={(e) => this.props.onUserSelected(user, e)}>
              <Avatar src={generateAvatarPic(user)} style={{ height: 80, width: 80, float: 'left' }} />
              <Details selected={selected}>
                <div>
                  <strong className="mt-user-name">{user.username}</strong>
                </div>
                <div className="mt-user-email">{user.email}</div>
                <div>
                  <i>Joined: {format(new Date(user.createdOn), 'MMMM do, yyyy')}</i>
                </div>
                <div>
                  <i>Last Active: {format(new Date(user.lastLoggedIn), 'MMMM do, yyyy')}</i>
                </div>
              </Details>
            </UserDiv>
          );
        })}
      </div>
    );
  }
}

const UserDiv = styled.div`
  margin: 20px;
  float: left;
  padding: 10px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.25s background;
  background: ${(props: SCompProps) => (props.selected ? theme.primary200.background : '')};
  color: ${(props: SCompProps) => (props.selected ? theme.primary200.color : '')};
  user-select: none;

  &:hover {
    background: ${(props: SCompProps) => (props.selected ? '' : theme.light100.background)};
    color: ${(props: SCompProps) => (props.selected ? '' : theme.light100.color)};
  }

  &:active {
    background: ${(props: SCompProps) => (props.selected ? '' : theme.light100.background)};
    color: ${(props: SCompProps) => (props.selected ? '' : theme.light100.color)};
  }
`;

const Details = styled.div`
  margin: 0 0 0 5px;
  display: inline-block;
  vertical-align: top;

  > .mt-user-email {
    border-bottom: 1px solid
      ${(props: SCompProps) => (props.selected ? theme.primary200.border : theme.light200.border)};
    margin: 0 0 2px 0;
    padding: 0 0 5px 0;
  }

  > div > i {
    color: ${(props: SCompProps) => (props.selected ? theme.primary200.softColor : theme.light200.softColor)};
    font-size: 0.85rem;
  }
`;
