import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Pager } from './pager';
import { Table, TableHeader, TableBody, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui';

type Props = {
  users: IUserEntry[]
};

export class UsersList extends React.PureComponent<Props, any> {
  render() {
    return (
      <Pager limit={10} offset={1} total={30} onPage={e => { }}>
        <div>
          <Table fixedHeader={true} multiSelectable={true} selectable={true}>
            <TableHeader displaySelectAll={true} enableSelectAll={true} adjustForCheckbox={true}>
              <TableRow>
                <TableHeaderColumn>User</TableHeaderColumn>
                <TableHeaderColumn>Joined</TableHeaderColumn>
                <TableHeaderColumn>Last Active</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody showRowHover={true}>
              {
                this.props.users.map( ( user, index ) => {
                  return (
                    <TableRow key={`user-${ index }`}>
                      <TableRowColumn>
                        {user.username}
                      </TableRowColumn>
                      <TableRowColumn>{user.createdOn}</TableRowColumn>
                      <TableRowColumn>{user.lastLoggedIn}</TableRowColumn>
                    </TableRow>
                  );
                } )
              }
            </TableBody>
          </Table>
        </div>
      </Pager>
    );
  }
}