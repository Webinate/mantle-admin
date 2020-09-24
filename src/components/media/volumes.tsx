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
import { Volume, PaginatedVolumeResponse, VolumeSortType, SortOrder, QueryVolumesArgs } from 'mantle';
import { format } from 'date-fns';
import Pager from '../pager';
import { formatBytes } from '../../utils/component-utils';

export type Props = {
  multiselect?: boolean;
  volumes: PaginatedVolumeResponse;
  loading: boolean;
  selectedUids: string[];
  activeFilters: Partial<QueryVolumesArgs>;
  onSelectionChanged: (uids: string[]) => void;
  getVolumes: (options: Partial<QueryVolumesArgs>) => void;
  onSort: (sortBy: VolumeSortType, sortDir: SortOrder) => void;
  openVolume: (volumeId: string) => void;
};

export type State = {};

export class Volumes extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    multiselect: true,
  };

  private _container: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.state = {};
    this._container = React.createRef();
  }

  componentWillReceiveProps(next: Props) {
    if (next.volumes !== this.props.volumes) this.props.onSelectionChanged([]);
  }

  private changeOrder(sort: VolumeSortType) {
    let order: SortOrder = 'desc';
    if (this.props.activeFilters.sortType === sort && this.props.activeFilters.sortOrder === 'desc') order = 'asc';

    this.props.onSort(sort, order);
  }

  private onSelectionChange(volumes: string[]) {
    this.props.onSelectionChanged(volumes);
  }

  private onSelection(e: React.MouseEvent<HTMLElement>, volume: Volume) {
    const selected = this.props.selectedUids;

    if (!this.props.multiselect) {
      this.onSelectionChange([volume._id as string]);
      return;
    }

    if (!e.ctrlKey && !e.shiftKey) {
      this.onSelectionChange([volume._id as string]);
    } else if (e.ctrlKey) {
      if (selected.indexOf(volume._id as string) === -1) this.onSelectionChange(selected.concat(volume._id as string));
      else this.onSelectionChange(selected.filter((i) => i !== volume._id));
    } else {
      const volumePage = this.props.volumes!;
      const allIds = volumePage.data.map((v) => v._id as string);

      let firstIndex = Math.min(
        allIds.indexOf(volume._id as string),
        selected.length > 0 ? allIds.indexOf(selected[0]) : 0
      );
      let lastIndex = Math.max(
        allIds.indexOf(volume._id as string),
        selected.length > 0 ? allIds.indexOf(selected[0]) : 0
      );

      this.onSelectionChange(allIds.slice(firstIndex, lastIndex + 1));
    }
  }

  render() {
    const selected = this.props.selectedUids;
    const volumes = this.props.volumes;
    const allSelected = this.props.selectedUids.length === volumes.data.length;
    const headers: { label: string; property: VolumeSortType }[] = [
      { label: 'Name', property: 'name' },
      { label: 'Memory', property: 'memory' },
      { label: 'Created', property: 'created' },
    ];
    const filters = this.props.activeFilters;

    return (
      <Pager
        index={volumes.index}
        limit={volumes.limit}
        total={volumes.count}
        loading={this.props.loading}
        onPage={(index) => {
          if (this._container.current) this._container.current.scrollTop = 0;

          this.props.getVolumes({ index: index });
        }}
      >
        <Container ref={this._container}>
          <Table className="mt-volume-table">
            <TableHeader>
              <TableRow>
                <TableCell padding="checkbox" sortDirection={filters.sortType === 'name' ? filters.sortOrder! : false}>
                  <Checkbox
                    id="mt-select-all"
                    checked={allSelected}
                    style={{ display: this.props.multiselect ? '' : 'none' }}
                    onClick={(e) => {
                      if (allSelected) this.onSelectionChange([]);
                      else this.onSelectionChange(volumes.data.map((v) => v._id as string));
                    }}
                  />
                </TableCell>
                <TableCell padding="checkbox" />
                {headers.map((h, index) => {
                  return (
                    <TableCell
                      key={`header-${index}`}
                      sortDirection={filters.sortType === h.property ? filters.sortOrder! : false}
                    >
                      <TableSortLabel
                        active={filters.sortType === h.property}
                        direction={filters.sortOrder!}
                        className={`mt-volume-header-${h.property}`}
                        onClick={(e) => this.changeOrder(h.property)}
                      >
                        {h.label}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {volumes.data.map((volume, index) => {
                return (
                  <TableRow
                    className="mt-volume-row"
                    hover
                    style={{ cursor: 'pointer' }}
                    role="checkbox"
                    key={`vol-row-${index}`}
                    onDoubleClick={(e) => this.props.openVolume(volume._id as string)}
                    onClick={(e) => {
                      this.onSelection(e, volume);
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        onClick={(e) => {
                          e.stopPropagation();

                          if (selected.indexOf(volume._id as string) !== -1)
                            this.onSelectionChange(selected.filter((v) => v !== volume._id));
                          else this.onSelectionChange(selected.concat(volume._id as string));
                        }}
                        className="mt-vol-checkbox"
                        checked={selected.indexOf(volume._id as string) !== -1}
                      />
                    </TableCell>
                    <TableCell padding="checkbox" className={`mt-vol-type mt-volume-type-${volume.type}`}>
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
                    <TableCell scope="row" component="th" className="mt-volume-name">
                      {volume.name}
                    </TableCell>
                    <TableCell className="mt-volume-memoryaloc">
                      {formatBytes(volume.memoryUsed!)} / {formatBytes(volume.memoryAllocated!)}
                    </TableCell>
                    <TableCell className="mt-volume-created">
                      {format(new Date(volume.created!), 'MMM do, yyyy')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Container>
      </Pager>
    );
  }
}

const Container = styled.div`
  table {
    background: ${theme.light100.background};
    user-select: none;
    table-layout: fixed;
    width: 100%;
  }

  td {
    overflow: hidden;
  }

  img {
    width: 70px;
  }

  td:first-child,
  td:nth-child(2),
  th:first-child,
  th:nth-child(2) {
    width: 70px;
    padding: 0;
  }
`;
