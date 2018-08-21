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
  selectedUids: string[];
  activeFilters: Partial<GetAllOptions>;
  onSelectionChanged: ( uids: string[] ) => void;
  getVolumes: ( options: Partial<GetAllOptions> ) => void;
  onSort: ( sortBy: SortTypes, sortDir: SortOrder ) => void;
  openVolume: ( volumeId: string ) => void;
}

export type State = {
}

export class Volumes extends React.Component<Props, State> {
  private _container: HTMLElement;

  constructor( props: Props ) {
    super( props );
    this.state = {
    };
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.volumes !== this.props.volumes )
      this.props.onSelectionChanged( [] );
  }

  private changeOrder( sort: SortTypes ) {
    let order: SortOrder = 'desc';
    if ( this.props.activeFilters.sort === sort && this.props.activeFilters.sortOrder === 'desc' )
      order = 'asc';

    this.props.onSort( sort, order );
  }

  private onSelectionChange( volumes: string[] ) {
    this.props.onSelectionChanged( volumes );
  }

  private onSelection( e: React.MouseEvent<HTMLElement>, volume: IVolume<'client'> ) {
    const selected = this.props.selectedUids;

    if ( !e.ctrlKey && !e.shiftKey ) {
      this.onSelectionChange( [ volume._id ] );
    }
    else if ( e.ctrlKey ) {
      if ( selected.indexOf( volume._id ) === -1 )
        this.onSelectionChange( selected.concat( volume._id ) );
      else
        this.onSelectionChange( selected.filter( i => i !== volume._id ) );
    }
    else {
      const volumePage = this.props.volumes!;
      const allIds = volumePage.data.map( v => v._id );

      let firstIndex = Math.min( allIds.indexOf( volume._id ), selected.length > 0 ? allIds.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( allIds.indexOf( volume._id ), selected.length > 0 ? allIds.indexOf( selected[ 0 ] ) : 0 );

      this.onSelectionChange( allIds.slice( firstIndex, lastIndex + 1 ) );
    }
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
    const filters = this.props.activeFilters;

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
                  sortDirection={filters.sort === 'name' ? filters.sortOrder : false}
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
                        sortDirection={filters.sort === h.property ? filters.sortOrder : false}
                      >
                        <TableSortLabel
                          active={filters.sort === h.property}
                          direction={filters.sortOrder}
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
                      onDoubleClick={e => this.props.openVolume( volume._id )}
                      onClick={e => {
                        this.onSelection( e, volume )
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
                        {volume.type === 'google' ? (
                          <Tooltip title="Google volume">
                            <img src="/images/server.svg" />
                          </Tooltip>
                        ) : (
                            <Tooltip title="Local volume">
                              <img src="/images/harddrive.svg" />
                            </Tooltip>
                          )}
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
  table {
    background: ${theme.light100.background };
    user-select: none;
  }

  img {
    width: 70px;
  }

  td:first-child, td:nth-child(2), th:first-child, th:nth-child(2) {
    width: 50px;
  }
`;