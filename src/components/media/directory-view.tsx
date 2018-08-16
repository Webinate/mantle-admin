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
import { GetOptions } from '../../../../../src/controllers/files';

export type SortTypes = 'name' | 'created' | 'memory';
export type SortOrder = 'asc' | 'desc';

export type Props = {
  volume: IVolume<'client'>;
  files: Page<IFileEntry<'client'>> | null;
  loading: boolean;
  selectedUids: string[];
  openDirectory: ( id: string, optons: GetOptions ) => void;
  onSelectionChanged: ( uids: string[] ) => void;
}

export type State = {
  order: SortOrder;
  orderBy: SortTypes;
}

export class DirectoryView extends React.Component<Props, State> {
  private _container: HTMLElement;

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

  private onSelectionChange( volumes: string[] ) {
    this.props.onSelectionChanged( volumes );
  }

  private getPreview( file: IFileEntry<'client'> ) {
    if ( file.mimeType === 'image/png' || file.mimeType === 'image/jpeg' || file.mimeType === 'image/jpg' || file.mimeType === 'image/gif' )
      return file.publicURL;
    else
      return '/images/harddrive.svg';
  }

  render() {
    const selected = this.props.selectedUids;
    const files = this.props.files;
    const headers: { label: string; property: SortTypes }[] = [
      { label: 'Name', property: 'name' },
      { label: 'Memory', property: 'memory' },
      { label: 'Created', property: 'created' }
    ];

    if ( !files )
      return <div>No files</div>

    const allSelected = this.props.selectedUids.length === files.data.length;

    return (
      <Pager
        index={files.index}
        limit={files.limit}
        total={files.count}
        loading={this.props.loading}
        onPage={( index ) => {
          if ( this._container )
            this._container.scrollTop = 0;

          this.props.openDirectory( this.props.volume._id, { index: index } )
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
                        this.onSelectionChange( files.data.map( v => v._id ) );
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
                files.data.map( ( file, index ) => {
                  return (
                    <TableRow
                      hover
                      style={{ cursor: 'pointer' }}
                      role="checkbox"
                      key={`vol-row-${ index }`}
                      onClick={e => {
                        if ( !e.ctrlKey )
                          this.onSelectionChange( [ file._id ] );
                        else {
                          if ( selected.indexOf( file._id ) !== -1 )
                            this.onSelectionChange( selected.filter( v => v !== file._id ) );
                          else
                            this.onSelectionChange( selected.concat( file._id ) );
                        }
                      }}
                    >
                      <TableCell
                        padding="checkbox"
                      >
                        <Checkbox
                          onClick={e => {
                            e.stopPropagation();

                            if ( selected.indexOf( file._id ) !== -1 )
                              this.onSelectionChange( selected.filter( v => v !== file._id ) );
                            else
                              this.onSelectionChange( selected.concat( file._id ) );
                          }}
                          className="mt-vol-checkbox"
                          checked={selected.indexOf( file._id ) !== -1}
                        />
                      </TableCell>
                      <TableCell
                        padding="checkbox"
                        className="mt-vol-type"
                      >
                        <div>
                          <img src={this.getPreview( file )} />
                        </div>
                      </TableCell>
                      <TableCell
                        scope="row"
                        component="th"
                        className="mt-vol-name"
                      >
                        {file.name}
                      </TableCell>
                      <TableCell
                        className="mt-vol-memoryaloc"
                      >
                        {formatBytes( file.size! )}
                      </TableCell>
                      <TableCell
                        className="mt-vol-created"
                      >
                        {format( new Date( file.created! ), 'MMM Do, YYYY' )}
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

  .mt-vol-type > div {
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .mt-vol-type img {
    max-width: 100%;
    max-height: 100%;
  }

  td:first-child, td:nth-child(2), th:first-child, th:nth-child(2) {
    width: 50px;
  }
`;