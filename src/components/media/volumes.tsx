import * as React from 'react';
import Table from '@material-ui/core/Table/Table';
import TableHeader from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

export type Props = {

}

export type State = {
  order: 'desc' | 'asc';
  orderBy: 'name' | 'date';
}

export class Volumes extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      order: 'desc',
      orderBy: 'name'
    };
  }

  private changeOrder( sort: 'name' | 'date' ) {
    this.setState( { orderBy: sort } );
  }

  render() {
    return <Table>
      <TableHeader>
        <TableRow>
          <TableCell
            numeric={false}
            padding={'default'}
            sortDirection={this.state.orderBy === 'name' ? this.state.order : false}
          >
            <Tooltip
              title="Sort"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={true}
                direction={this.state.order}
                onClick={( e ) => this.changeOrder( 'name' )}
              >
                First Label
              </TableSortLabel>
            </Tooltip>
          </TableCell>

          <TableCell
            numeric={false}
            padding={'default'}
            sortDirection={this.state.orderBy === 'date' ? this.state.order : false}
          >
            <Tooltip
              title="Sort"
              placement="bottom-start"
              enterDelay={300}
            >
              <TableSortLabel
                active={true}
                direction={this.state.order}
                onClick={( e ) => this.changeOrder( 'date' )}
              >
                Second Label
              </TableSortLabel>
            </Tooltip>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            Hello
          </TableCell>
          <TableCell>
            World
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  }
}