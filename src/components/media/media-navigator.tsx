import * as React from 'react';
import { Volumes } from './volumes';
import { IVolume, Page, IFileEntry } from '../../../../../src';
import { GetAllOptions } from '../../../../../src/lib-frontend/volumes';
import SplitPanel from '../split-panel';
import VolumeSidePanel from './volume-sidepanel';
import { DirectoryView } from './directory-view';
import FileSidePanel from './file-sidepanel';

export type Props = {
  activeVolume?: IVolume<'client'> | null;
  volumes?: Page<IVolume<'client'>> | null;
  files?: Page<IFileEntry<'client'>> | null;
  loading: boolean;
  selectedIds: string[];
  activeVolumeId?: string;
  onUploadFiles: ( files: File[] ) => void;
  onDelete: () => void;
  getVolumes?: ( options: Partial<GetAllOptions> ) => void;
  openVolume?: ( volumeId: string ) => void;
  openDirectory?: ( volumeId: string ) => void;
  onSelectionChanged: ( uids: string[] ) => void;
}

export type State = {

}

export class MediaNavigator extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
  }

  componentDidMount() {
    if ( this.props.activeVolumeId ) {
      this.props.openDirectory!( this.props.activeVolumeId )
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
    let activeView: JSX.Element | null = null;

    if ( volumePage ) {
      activeView = <Volumes
        openVolume={this.props.openVolume!}
        onSelectionChanged={this.props.onSelectionChanged}
        selectedUids={this.props.selectedIds}
        getVolumes={this.props.getVolumes!}
        loading={this.props.loading}
        volumes={volumePage}
      />
    }
    else if ( activeVolume ) {
      activeView = <DirectoryView
        volume={activeVolume}
        files={filesPage!}
        openDirectory={this.props.openDirectory!}
        loading={this.props.loading}
        onSelectionChanged={this.props.onSelectionChanged}
        selectedUids={this.props.selectedIds}
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
              selectedIds={this.props.selectedIds}
              onUploadFiles={this.props.onUploadFiles}
              onDelete={() => this.props.onDelete()}
            />
          }
          else {
            return <VolumeSidePanel
              onOpen={this.props.openVolume!}
              volumes={volumePage ? volumePage.data : []}
              onDelete={() => this.props.onDelete()}
            />;
          }
        }}
      />
    </div>
  }
}