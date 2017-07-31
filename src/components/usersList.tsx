import * as React from 'react';
import { IUserEntry } from 'modepress';
import { FontIcon } from 'material-ui';
import { default as styled } from "../theme/styled";

type Props = {
  users: IUserEntry[]
};

export class UsersList extends React.PureComponent<Props, any> {
  render() {
    return (
      <div>
        <Filters>
          <FilterItem>User</FilterItem>
          <FilterItem>Joined</FilterItem>
          <FilterItem>Last Active</FilterItem>
        </Filters>
        {
          this.props.users.map(( user, index ) => {
            return (
              <div key={`user-${ index }`}>
                <FontIcon className="icon-person" />
                {user.username}
              </div>
            );
          } )
        }
      </div>
    );
  }
}

const Filters = styled.div`
  background: #eee;
  display: flex;

  > * {
    flex: 1 0 0;
  }
  > div:nth-child(1) {
    flex: 2 0 0;
  }
`;
const FilterItem = styled.div`
`;