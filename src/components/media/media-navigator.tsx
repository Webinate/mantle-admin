import * as React from 'react';
import Pager from '../pager';
import { Volumes } from './volumes';
import { IVolume } from '../../../../../src';

export type Props = {
  volumes: IVolume<'client'>[];
}

export type State = {

}

export class MediaNavigator extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
  }

  render() {
    return <div style={{ position: 'relative' }}>
      <Pager
        index={0}
        limit={10}
        total={100}
        loading={false}
        onPage={() => {

        }}
      >
        <Volumes volumes={this.props.volumes} />
      </Pager>
    </div>
  }
}