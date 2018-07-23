import * as React from 'react';
import Table from '@material-ui/core/Table/Table';
import TableHeader from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import { default as styled } from '../../theme/styled';

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
    return <Container>
      <Paper>
        <Table>
          <TableHeader>
            <TableRow>

              <TableCell
                numeric={false}
                padding="checkbox"
                sortDirection={this.state.orderBy === 'name' ? this.state.order : false}
              >
                <Checkbox
                  onClick={e => { }}
                />
              </TableCell>
              <TableCell
                padding="checkbox"
              />
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
            <TableRow hover role="checkbox">
              <TableCell
                padding="checkbox"
              >
                <Checkbox />
              </TableCell>
              <TableCell
                padding="checkbox"
              >
                <img src="/images/post-feature.svg" />
              </TableCell>
              <TableCell
                scope="row"
                component="th">
                Hello This is a lot longer
          </TableCell>
              <TableCell>
                World
          </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Container>
  }
}

const Container = styled.div`
  img {
    height: 50px;
    width: 50px;
  }

  td:first-child, td:nth-child(2), th:first-child, th:nth-child(2) {
    width: 50px;
  }
`;