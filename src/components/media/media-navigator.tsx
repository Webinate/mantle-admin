import * as React from 'react';
import { Volumes } from './volumes';
import { IVolume, Page } from '../../../../../src';
import { GetAllOptions } from '../../../../../src/lib-frontend/volumes';
import SplitPanel from '../split-panel';
import Paper from '@material-ui/core/Paper';
import VolumeSidePanel from './volume-sidepanel';

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

  componentDidMount() {
    this.props.getVolumes( {
      index: 0
    } );
  }

  render() {
    const volumePage = this.props.volumes;
    const mediaSelected = this.props.selectedVolumes.length > 0;
    let activeView: JSX.Element | null = null;

    if ( volumePage ) {
      activeView = <Volumes
        onVolumesSelected={this.props.onVolumesSelected}
        selectedUids={this.props.selectedVolumes}
        getVolumes={this.props.getVolumes}
        loading={this.props.loading}
        volumes={volumePage}
      />
    }

    return <div style={{ position: 'relative' }}>
      <SplitPanel
        collapsed={mediaSelected ? 'none' : 'right'}
        ratio={0.7}
        first={() => activeView}
        second={() => {
          return <Paper
          >
            <VolumeSidePanel />
          </Paper>
        }}
      />
    </div>
  }
}