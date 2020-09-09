import * as React from 'react';
import FolderIcon from '@material-ui/icons/Folder';
import CloudIcon from '@material-ui/icons/Cloud';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { Volume } from 'mantle';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';

export type Props = {
  volume: Volume;
  onVolumeSelected: () => void;
};

export type State = {};

export class BreadCrumb extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchFilter: '',
    };
  }

  render() {
    return (
      <Container>
        <h2 onClick={(e) => this.props.onVolumeSelected()}>
          {this.props.volume.type === 'local' ? <FolderIcon /> : <CloudIcon />}
          <KeyboardArrowRight />/{this.props.volume.name}
        </h2>
      </Container>
    );
  }
}

const Container = styled.div`
  h2 {
    cursor: pointer;
    user-select: none;
    border-bottom: 1px solid transparent;
    display: inline-block;
    padding: 0 0 5px 0;
    margin: 0;

    &:hover {
      border-bottom: 1px solid ${theme.primary100.background};

      svg {
        color: ${theme.primary100.background};
      }
    }
  }

  svg {
    vertical-align: top;
    color: ${theme.light400.softColor};
  }
`;
