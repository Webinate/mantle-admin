import * as React from 'react';
import { Volumes } from './volumes';
import { IVolume, Page } from '../../../../../src';

export type Props = {
  volumes: Page<IVolume<'client'>> | null;
  loading: boolean;
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
        loading={this.props.loading}
        volumes={volumePage}
      /> : undefined}
    </div>
  }
}