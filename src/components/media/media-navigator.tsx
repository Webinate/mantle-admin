import * as React from 'react';
import { Volumes } from './volumes';
import { IVolume, Page, IFileEntry } from '../../../../../src';
import { GetAllOptions } from '../../../../../src/lib-frontend/volumes';
import { GetAllOptions as FileGetOptions } from '../../../../../src/lib-frontend/files';
import SplitPanel from '../split-panel';
import VolumeSidePanel from './volume-sidepanel';
import { DirectoryView, SortTypes, SortOrder } from './directory-view';
import FileSidePanel from './file-sidepanel';

export type Props = {
  activeVolume?: IVolume<'client'> | null;
  volumes?: Page<IVolume<'client'>> | null;
  files?: Page<IFileEntry<'client'>> | null;
  loading: boolean;
  selectedIds: string[];
  activeVolumeId?: string;
  filesFilters?: Partial<FileGetOptions>;
  volumeFilters?: Partial<GetAllOptions>;
  onUploadFiles: ( files: File[] ) => void;
  onDelete: () => void;
  getVolumes?: ( options: Partial<GetAllOptions> ) => void;
  openVolume?: ( volumeId: string ) => void;
  openDirectory?: ( volumeId: string, options: Partial<GetAllOptions> ) => void;
  onSelectionChanged: ( uids: string[] ) => void;
  onSort: ( sortBy: SortTypes, sortDir: SortOrder ) => void;
}

export type State = {

}

export class MediaNavigator extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
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

    return <div style={{ position: 'relative' }}>
      <SplitPanel
        collapsed={collapsed}
        ratio={0.7}
        first={() => activeView}
        second={() => {
          if ( this.props.activeVolumeId ) {
            return <FileSidePanel
              selectedFile={selectedFile}
              selectedIds={this.props.selectedIds}
              onUploadFiles={this.props.onUploadFiles}
              onDelete={() => this.props.onDelete()}
              onRename={() => { }}
            />
          }
          else {
            return <VolumeSidePanel
              selectedVolume={selectedVolume}
              onOpen={this.props.openVolume!}
              onDelete={() => this.props.onDelete()}
              onRename={() => { }}
            />;
          }
        }}
      />
    </div>
  }
}