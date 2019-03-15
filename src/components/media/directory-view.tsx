import * as React from 'react';
import Table from '@material-ui/core/Table/Table';
import TableHeader from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import { IVolume, Page, IFileEntry } from '../../../../../src';
import * as format from 'date-fns/format';
import Pager from '../pager';
import { formatBytes } from '../../utils/component-utils';
import { FilesGetOptions } from 'mantle';

export type SortTypes = 'name' | 'created' | 'memory';
export type SortOrder = 'asc' | 'desc';

export type Props = {
  multiselect?: boolean;
  volume: IVolume<'client' | 'expanded'>;
  files: Page<IFileEntry<'client' | 'expanded'>> | null;
  loading: boolean;
  selectedUids: string[];
  activeFilters: Partial<FilesGetOptions>;
  openDirectory: (id: string, optons: FilesGetOptions) => void;
  onSelectionChanged: (uids: string[]) => void;
  onSort: (sortBy: SortTypes, sortDir: SortOrder) => void;
};

export type State = {};

export class DirectoryView extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    multiselect: true
  };

  private _container: HTMLElement;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private changeOrder(sort: SortTypes) {
    let order: SortOrder = 'desc';
    if (this.props.activeFilters.sort === sort && this.props.activeFilters.sortOrder === 'desc') order = 'asc';

    this.props.onSort(sort, order);
  }

  private onSelectionChange(volumes: string[]) {
    this.props.onSelectionChanged(volumes);
  }

  private getPreview(file: IFileEntry<'client' | 'expanded'>) {
    if (
      file.mimeType === 'image/png' ||
      file.mimeType === 'image/jpeg' ||
      file.mimeType === 'image/jpg' ||
      file.mimeType === 'image/gif'
    )
      return file.publicURL;
    else return '/images/harddrive.svg';
  }

  private onSelection(e: React.MouseEvent<HTMLElement>, volume: IFileEntry<'client' | 'expanded'>) {
    const selected = this.props.selectedUids;

    if (!this.props.multiselect) {
      this.onSelectionChange([volume._id]);
      return;
    }

    if (!e.ctrlKey && !e.shiftKey) {
      this.onSelectionChange([volume._id]);
    } else if (e.ctrlKey) {
      if (selected.indexOf(volume._id) === -1) this.onSelectionChange(selected.concat(volume._id));
      else this.onSelectionChange(selected.filter(i => i !== volume._id));
    } else {
      const filesPage = this.props.files!;
      const allIds = filesPage.data.map(v => v._id);

      let firstIndex = Math.min(allIds.indexOf(volume._id), selected.length > 0 ? allIds.indexOf(selected[0]) : 0);
      let lastIndex = Math.max(allIds.indexOf(volume._id), selected.length > 0 ? allIds.indexOf(selected[0]) : 0);

      this.onSelectionChange(allIds.slice(firstIndex, lastIndex + 1));
    }
  }

  render() {
    const selected = this.props.selectedUids;
    const files = this.props.files;
    const headers: { label: string; property: SortTypes }[] = [
      { label: 'Name', property: 'name' },
      { label: 'Memory', property: 'memory' },
      { label: 'Created', property: 'created' }
    ];

    if (!files) return <div>No files</div>;

    const allSelected = this.props.selectedUids.length === files.data.length;
    const filters = this.props.activeFilters;

    return (
      <Pager
        index={files.index}
        limit={files.limit}
        total={files.count}
        loading={this.props.loading}
        onPage={index => {
          if (this._container) this._container.scrollTop = 0;

          this.props.openDirectory(this.props.volume._id, { index: index });
        }}
      >
        <Container innerRef={elm => (this._container = elm)}>
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
                    style={{ display: this.props.multiselect ? '' : 'none' }}
                    checked={allSelected}
                    onClick={e => {
                      if (allSelected) this.onSelectionChange([]);
                      else this.onSelectionChange(files.data.map(v => v._id));
                    }}
                  />
                </TableCell>
                <TableCell padding="checkbox" />
                {headers.map((h, index) => {
                  return (
                    <TableCell
                      key={`header-${index}`}
                      className={`mt-file-header-${h.label}`}
                      sortDirection={filters.sort === h.property ? filters.sortOrder : false}
                    >
                      <TableSortLabel
                        active={filters.sort === h.property}
                        direction={filters.sortOrder}
                        onClick={e => this.changeOrder(h.property)}
                      >
                        {h.label}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {files.data.map((file, index) => {
                return (
                  <TableRow
                    hover
                    style={{ cursor: 'pointer' }}
                    role="checkbox"
                    key={`vol-row-${index}`}
                    className={`mt-file-row mt-file-row-${index}`}
                    onClick={e => {
                      this.onSelection(e, file);
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        onClick={e => {
                          e.stopPropagation();

                          if (selected.indexOf(file._id) !== -1)
                            this.onSelectionChange(selected.filter(v => v !== file._id));
                          else this.onSelectionChange(selected.concat(file._id));
                        }}
                        className="mt-file-checkbox"
                        checked={selected.indexOf(file._id) !== -1}
                      />
                    </TableCell>
                    <TableCell padding="checkbox" className="mt-file-preview">
                      <div>
                        <img src={this.getPreview(file)} />
                      </div>
                    </TableCell>
                    <TableCell className="mt-file-name">{file.name}</TableCell>
                    <TableCell className="mt-file-memory">{formatBytes(file.size!)}</TableCell>
                    <TableCell className="mt-file-created">{format(new Date(file.created!), 'MMM Do, YYYY')}</TableCell>
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
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mt-file-preview > div {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    height: 100%;
    width: 100%;
  }

  .mt-file-preview img {
    max-width: 100%;
    max-height: 100%;
  }

  td:first-child,
  td:nth-child(2),
  th:first-child,
  th:nth-child(2) {
    width: 80px;
    height: 80px;
    padding: 0;
  }
`;
