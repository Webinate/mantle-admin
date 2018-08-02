import * as React from 'react';
import { Volumes } from './volumes';
import { IVolume, Page } from '../../../../../src';
import { GetAllOptions } from '../../../../../src/lib-frontend/volumes';

export type Props = {
  volumes: Page<IVolume<'client'>> | null;
  loading: boolean;
  selectedVolumes: string[];
  getVolumes: ( options: Partial<GetAllOptions> ) => void;
  onVolumesSelected: ( uids: string[] ) => void;
}

export type State = {

}

export class MediaNavigator extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
  }

  render() {
    const volumePage = this.props.volumes;

    return <div style={{ position: 'relative' }}>
      {volumePage ? <Volumes
        onVolumesSelected={this.props.onVolumesSelected}
        selectedUids={this.props.selectedVolumes}
        getVolumes={this.props.getVolumes}
        loading={this.props.loading}
        volumes={volumePage}
      /> : undefined}
    </div>
  }
}