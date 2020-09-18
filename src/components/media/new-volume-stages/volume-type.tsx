import * as React from 'react';
import { default as styled } from '../../../theme/styled';
import StorageIcon from '@material-ui/icons/Storage';
import CloudIcon from '@material-ui/icons/CloudCircle';
import Fab from '@material-ui/core/Fab';
import { AddVolumeInput, VolumeType as VolumeTypeEnum } from 'mantle';

export type Props = {
  volumeType: VolumeTypeEnum;
  onChange: (props: Partial<AddVolumeInput>) => void;
};

export default class VolumeType extends React.Component<Props> {
  private _volumeOptions: {
    icon: JSX.Element;
    heading: string;
    description: string;
    type: VolumeTypeEnum;
  }[];

  constructor(props: Props) {
    super(props);
    this._volumeOptions = [
      {
        icon: <StorageIcon />,
        type: 'local',
        heading: 'Local Storage',
        description: 'This is local storage',
      },
      {
        icon: <CloudIcon />,
        type: 'google',
        heading: 'Google Storage',
        description: 'This is google storage',
      },
    ];
  }

  render() {
    return (
      <VolumeTypes>
        {this._volumeOptions.map((options, index) => {
          return (
            <div className="mt-volume-types" key={`type=${index}`}>
              <div>
                <Fab
                  color={this.props.volumeType === options.type ? 'primary' : undefined}
                  onClick={(e) => this.props.onChange({ type: options.type })}
                >
                  {options.icon}
                </Fab>
              </div>
              <div>
                <h2>{options.heading}</h2>
                {options.description}
              </div>
            </div>
          );
        })}
      </VolumeTypes>
    );
  }
}

const VolumeTypes = styled.div`
  .mt-volume-types {
    display: flex;
    padding: 20px;

    & > div:nth-child(1) {
      flex: 0;
      align-self: center;
      padding: 0 5px;
    }

    & > div:nth-child(2) {
      flex: 1;
      align-self: center;
      padding: 0 5px;
    }
  }
`;
