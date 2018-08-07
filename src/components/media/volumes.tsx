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
import { formatBytes } from '../../utils/component-utils';
import { GetAllOptions } from '../../../../../src/lib-frontend/volumes';

export type SortTypes = 'name' | 'created' | 'memory';
export type SortOrder = 'asc' | 'desc';

export type Props = {
  volumes: Page<IVolume<'client'>>;
  loading: boolean;
  onVolumesSelected: ( uids: string[] ) => void;
  getVolumes: ( options: Partial<GetAllOptions> ) => void;
  selectedUids: string[];
  openVolume: ( volume: IVolume<'client'> ) => void;
}

export type State = {
  order: SortOrder;
  orderBy: SortTypes;
}

export class Volumes extends React.Component<Props, State> {
  private _container: HTMLElement;

  constructor( props: Props ) {
    super( props );
    this.state = {
      order: 'desc',
      orderBy: 'name'
    };
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.volumes !== this.props.volumes )
      this.props.onVolumesSelected( [] );
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

  private onSelectionChange( volumes: string[] ) {
    this.props.onVolumesSelected( volumes );
  }

  render() {
    const selected = this.props.selectedUids;
    const volumes = this.props.volumes;
    const allSelected = this.props.selectedUids.length === volumes.data.length;
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
        onPage={( index ) => {
          if ( this._container )
            this._container.scrollTop = 0;

          this.props.getVolumes( { index: index } )
        }}
      >
        <Container innerRef={elm => this._container = elm}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  numeric={false}
                  padding="checkbox"
                  sortDirection={this.state.orderBy === 'name' ? this.state.order : false}
                >
                  <Checkbox
                    id="mt-select-all"
                    checked={allSelected}
                    onClick={e => {
                      if ( allSelected )
                        this.onSelectionChange( [] );
                      else
                        this.onSelectionChange( volumes.data.map( v => v._id ) );
                    }}
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
                volumes.data.map( ( volume, index ) => {
                  return (
                    <TableRow
                      hover
                      style={{ cursor: 'pointer' }}
                      role="checkbox"
                      key={`vol-row-${ index }`}
                      onDoubleClick={e => this.props.openVolume( volume )}
                      onClick={e => {
                        if ( selected.indexOf( volume._id ) === -1 )
                          this.onSelectionChange( selected.concat( volume._id ) );
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                      >
                        <Checkbox
                          onClick={e => {
                            e.stopPropagation();

                            if ( selected.indexOf( volume._id ) !== -1 )
                              this.onSelectionChange( selected.filter( v => v !== volume._id ) );
                            else
                              this.onSelectionChange( selected.concat( volume._id ) );
                          }}
                          className="mt-vol-checkbox"
                          checked={selected.indexOf( volume._id ) !== -1}
                        />
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                        className="mt-vol-type"
                      >
                        <Tooltip title="Local volume">
                          <img src="/images/harddrive.svg" />
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        scope="row"
                        component="th"
                        className="mt-vol-name"
                      >
                        {volume.name}
                      </TableCell>
                      <TableCell
                        className="mt-vol-memoryaloc"
                      >
                        {formatBytes( volume.memoryUsed! )} / {formatBytes( volume.memoryAllocated! )}
                      </TableCell>
                      <TableCell
                        className="mt-vol-created"
                      >
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
    width: 70px;
  }

  td:first-child, td:nth-child(2), th:first-child, th:nth-child(2) {
    width: 50px;
  }
`;