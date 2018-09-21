import * as React from 'react';
import { Volumes } from './volumes';
import { IVolume, Page, IFileEntry } from '../../../../../src';
import { VolumesGetOptions } from 'modepress';
import { FilesGetOptions } from 'modepress';
import SplitPanel from '../split-panel';
import VolumeSidePanel from './volume-sidepanel';
import { DirectoryView, SortTypes, SortOrder } from './directory-view';
import theme from '../../theme/mui-theme';
import FileSidePanel from './file-sidepanel';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';

export type Props = {
  animated: boolean;
  multiselect?: boolean;
  activeVolume?: IVolume<'client'> | null;
  volumes?: Page<IVolume<'client'>> | null;
  files?: Page<IFileEntry<'client'>> | null;
  loading: boolean;
  selectedIds: string[];
  activeVolumeId?: string;
  filesFilters?: Partial<FilesGetOptions>;
  volumeFilters?: Partial<VolumesGetOptions>;
  style?: React.CSSProperties;
  onRename: ( name: string, id: string ) => void;
  onUploadFiles?: ( files: File[] ) => void;
  onDelete: () => void;
  getVolumes?: ( options: Partial<VolumesGetOptions> ) => void;
  openVolume?: ( volumeId: string ) => void;
  openDirectory?: ( volumeId: string, options: Partial<FilesGetOptions> ) => void;
  onSelectionChanged: ( uids: string[] ) => void;
  onSort: ( sortBy: SortTypes, sortDir: SortOrder ) => void;
  renderOptionalButtons?: () => undefined | null | JSX.Element;
}

export type State = {
  deleteMessage: string | null;
  showRenameForm: boolean;
  newName: string;
}

export class MediaNavigator extends React.Component<Props, State> {

  static defaultProps: Partial<Props> = {
    multiselect: true
  }

  constructor( props: Props ) {
    super( props );
    this.state = {
      deleteMessage: null,
      showRenameForm: false,
      newName: ''
    }
  }

  componentDidMount() {
    if ( this.props.activeVolumeId ) {
      this.props.openDirectory!( this.props.activeVolumeId, { index: 0 } )
    }
    else {
      this.props.getVolumes!( {
        index: 0
      } );
    }
  }

  renderRenameForm() {
    return <Dialog
      open={this.state.showRenameForm}
      onClose={() => this.setState( { showRenameForm: false } )}
      aria-labelledby="form-dialog-title"
    >
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="mt-rename-media"
          label="Enter new name"
          fullWidth
          value={this.state.newName}
          onChange={e => this.setState( { newName: e.currentTarget.value } )}
        />
      </DialogContent>
      <DialogActions>
        <Button
          id="mt-media-cancel-btn"
          onClick={() => this.setState( { showRenameForm: false } )}
          color="primary"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          id="mt-media-confirm-btn"
          disabled={this.state.newName.trim() === ''}
          onClick={() => {
            this.props.onRename( this.state.newName, this.props.selectedIds[ this.props.selectedIds.length - 1 ] );
            this.setState( { showRenameForm: false } );
          }}
          color="primary"
        >
          Rename
        </Button>
      </DialogActions>
    </Dialog>
  }

  renderConfirmDelete() {
    return (
      <Dialog
        open={this.state.deleteMessage ? true : false}
        onClose={e => this.setState( { deleteMessage: null } )}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          <DialogContentText id="mt-media-delete-msg">
            {this.state.deleteMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="mt-media-cancel-btn" onClick={e => this.setState( { deleteMessage: null } )}>
            Cancel
          </Button>
          <Button
            variant="contained"
            id="mt-media-confirm-btn"
            style={{ background: theme.error.background, color: theme.error.color }}
            onClick={e => {
              this.props.onDelete();
              this.setState( {
                deleteMessage: null
              } );
            }}
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private onDelete() {
    const selectedUids = this.props.selectedIds;

    if ( selectedUids.length === 0 )
      return;

    const numToDelete = this.props.selectedIds.length;
    const volumePage = this.props.volumes;
    let selectedFile: IFileEntry<'client'> | null = null;
    let selectedVolume: IVolume<'client'> | null = null;
    const filesPage = this.props.files;

    if ( volumePage ) {
      selectedVolume = selectedUids.length > 0 ?
        volumePage.data.find( v => v._id === selectedUids[ selectedUids.length - 1 ] ) || null : null;

      if ( selectedUids.length === 1 && selectedVolume )
        this.setState( { deleteMessage: `Are you sure you want to delete the volume ${ selectedVolume.name }?` } );
      else
        this.setState( { deleteMessage: `Are you sure you want to delete these [${ numToDelete }] volumes?` } );
    }
    else {
      if ( filesPage && this.props.selectedIds.length > 0 )
        selectedFile = filesPage.data.find( f => f._id === this.props.selectedIds[ this.props.selectedIds.length - 1 ] ) || null;

      if ( selectedUids.length === 1 && selectedFile )
        this.setState( { deleteMessage: `Are you sure you want to delete the file ${ selectedFile.name }?` } );
      else
        this.setState( { deleteMessage: `Are you sure you want to delete these [${ numToDelete }] files?` } );
    }
  }

  render() {
    const volumePage = this.props.volumes;
    const filesPage = this.props.files;
    const activeVolume = this.props.activeVolume;
    const mediaSelected = this.props.selectedIds.length > 0;
    const selectedUids = this.props.selectedIds;
    let activeView: JSX.Element | null = null;
    let selectedFile: IFileEntry<'client'> | null = null;
    let selectedVolume: IVolume<'client'> | null = null;

    if ( volumePage ) {
      selectedVolume = selectedUids.length > 0 ?
        volumePage.data.find( v => v._id === selectedUids[ selectedUids.length - 1 ] ) || null : null;

      activeView = <Volumes
        multiselect={this.props.multiselect}
        openVolume={this.props.openVolume!}
        activeFilters={this.props.volumeFilters!}
        onSelectionChanged={this.props.onSelectionChanged}
        selectedUids={selectedUids}
        getVolumes={this.props.getVolumes!}
        loading={this.props.loading}
        onSort={this.props.onSort}
        volumes={volumePage}
      />
    }
    else if ( activeVolume ) {
      if ( filesPage && this.props.selectedIds.length > 0 ) {
        selectedFile = filesPage.data.find( f => f._id === this.props.selectedIds[ this.props.selectedIds.length - 1 ] ) || null;
      }

      activeView = <DirectoryView
        multiselect={this.props.multiselect}
        volume={activeVolume}
        files={filesPage!}
        activeFilters={this.props.filesFilters!}
        openDirectory={this.props.openDirectory!}
        loading={this.props.loading}
        onSort={this.props.onSort}
        onSelectionChanged={this.props.onSelectionChanged}
        selectedUids={selectedUids}
      />
    }

    let collapsed: 'right' | 'none' = 'right';

    if ( !this.props.activeVolumeId && mediaSelected )
      collapsed = 'none';
    else if ( this.props.activeVolumeId )
      collapsed = 'none';

    return <div style={{ position: 'relative', ...this.props.style }}>
      <SplitPanel
        collapsed={collapsed}
        delay={this.props.animated ? undefined : 0}
        ratio={0.7}
        first={() => activeView}
        second={() => {
          if ( this.props.activeVolumeId ) {
            return <FileSidePanel
              selectedFile={selectedFile}
              selectedIds={this.props.selectedIds}
              onUploadFiles={this.props.onUploadFiles}
              onDelete={() => this.onDelete()}
              onRename={() => this.setState( { newName: '', showRenameForm: true } )}
              renderOptionalButtons={this.props.renderOptionalButtons}
            />
          }
          else {
            return <VolumeSidePanel
              selectedVolume={selectedVolume}
              onOpen={this.props.openVolume!}
              onDelete={() => this.onDelete()}
              onRename={() => this.setState( { newName: '', showRenameForm: true } )}
            />;
          }
        }}
      />
      {this.renderConfirmDelete()}
      {this.renderRenameForm()}
    </div>
  }
}