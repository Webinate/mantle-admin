import * as React from 'react';
import Table from '@material-ui/core/Table/Table';
import TableHeader from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import { IVolume, Page } from '../../../../../src';
import * as format from 'date-fns/format';
import Pager from '../pager';

export type SortTypes = 'name' | 'created' | 'memory';
export type SortOrder = 'asc' | 'desc';

export type Props = {
  volumes: Page<IVolume<'client'>>;
  loading: boolean;
}

export type State = {
  order: SortOrder;
  orderBy: SortTypes;
}

export class Volumes extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      order: 'desc',
      orderBy: 'name'
    };
  }

  private changeOrder( sort: SortTypes ) {
    let order: SortOrder = 'desc';
    if ( this.state.orderBy === sort && this.state.order === 'desc' )
      order = 'asc';

    this.setState( {
      orderBy: sort,
      order: order
    } );
  }

  private formatBytes( bytes: number, decimals = 2 ) {
    if ( bytes === 0 )
      return '0 Bytes';

    let k = 1024,
      dm = decimals || 2,
      sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ],
      i = Math.floor( Math.log( bytes ) / Math.log( k ) );

    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];
  }

  render() {
    const volumes = this.props.volumes;
    const headers: { label: string; property: SortTypes }[] = [
      { label: 'Name', property: 'name' },
      { label: 'Memory', property: 'memory' },
      { label: 'Created', property: 'created' }
    ];

    return (
      <Pager
        index={volumes.index}
        limit={volumes.limit}
        total={volumes.count}
        loading={this.props.loading}
        onPage={() => {

        }}
      >
        <Container>
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
                {
                  headers.map( ( h, index ) => {
                    return (
                      <TableCell
                        key={`header-${ index }`}
                        sortDirection={this.state.orderBy === h.property ? this.state.order : false}
                      >
                        <TableSortLabel
                          active={this.state.orderBy === h.property}
                          direction={this.state.order}
                          onClick={( e ) => this.changeOrder( h.property )}
                        >
                          {h.label}
                        </TableSortLabel>
                      </TableCell>
                    );
                  } )
                }
              </TableRow>
            </TableHeader>

            <TableBody>
              {
                volumes.data.map( volume => {
                  return (
                    <TableRow hover role="checkbox">
                      <TableCell
                        padding="checkbox"
                      >
                        <Checkbox />
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                      >
                        <Tooltip title="Google bucket">
                          <img src="/images/post-feature.svg" />
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        scope="row"
                        component="th">
                        {volume.name}
                      </TableCell>
                      <TableCell>
                        {this.formatBytes( volume.memoryUsed! )}
                      </TableCell>
                      <TableCell>
                        {format( new Date( volume.created! ), 'MMM Do, YYYY' )}
                      </TableCell>
                    </TableRow>
                  );
                } )
              }
            </TableBody>
          </Table>
        </Container>
      </Pager>
    );
  }
}

const Container = styled.div`
  background: ${theme.light100.background };

  img {
    height: 50px;
    width: 50px;
  }

  td:first-child, td:nth-child(2), th:first-child, th:nth-child(2) {
    width: 50px;
  }
`;