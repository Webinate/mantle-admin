import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Pager } from './pager';
import { Avatar } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import * as moment from 'moment';

type Props = {
  users: IUserEntry[]
};

export class UsersList extends React.PureComponent<Props, any> {
  render() {
    return (
      <Pager limit={10} offset={0} total={10} onPage={e => { }}>
        {this.props.users.map( ( user, index ) => {
          return <User key={`user-${ index }`}>
            <Avatar
              src="/images/avatar.svg"
              size={80}
            />
            <Details>
              <div><strong className="mt-user-name">{user.username}</strong></div>
              <div className="mt-user-email">{user.email}</div>
              <div><i>Joined: {moment( user.createdOn ).format( 'MMMM Do YYYY' )}</i></div>
              <div><i>Last Active: {moment( user.lastLoggedIn ).format( 'MMMM Do YYYY' )}</i></div>
            </Details>
          </User>
        } )}
      </Pager>
    );
  }
}

const User = styled.div`
  margin: 20px;
  float: left;
`;

const Details = styled.div`
  margin: 0 0 0 5px;
  display: inline-block;
  vertical-align: top;

  > .mt-user-email {
    border-bottom: 1px solid ${theme.light200.border };
    margin: 0 0 2px 0;
    padding: 0 0 5px 0;
  }

  > div > i {
    color: ${theme.light200.softColor };
    font-size: 0.85rem;
  }
`;