import * as React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { IVolume } from '../../../../../src';
import { default as styled } from '../../theme/styled';
import { formatBytes } from '../../utils/component-utils';

export type Props = {
  isAdmin: boolean;
}

export type State = {
  volumeProps: Partial<IVolume<'client'>>
}

export default class NewVolumeForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      volumeProps: {
        name: '',
        memoryAllocated: 500 * 1024 * 1024
      }
    };
  }

  render() {
    return (
      <Container>
        <div>
          <FormControl>
            <InputLabel htmlFor="mt-volume-name">Volume Name</InputLabel>
            <Input
              id="mt-volume-name"
              autoFocus={true}
              value={this.state.volumeProps.name}
              onChange={e => this.setState( { volumeProps: { ...this.state.volumeProps, name: e.currentTarget.value } } )}
            />
            <FormHelperText id="mt-volume-name-error"></FormHelperText>
          </FormControl>
        </div>
        <div>
          <FormControl disabled={!this.props.isAdmin}>
            <InputLabel htmlFor="mt-volume-memory">Memory Allocated</InputLabel>
            <Input
              id="mt-volume-memory"
              type="number"
              value={this.state.volumeProps.memoryAllocated}
              onChange={e => this.setState( { volumeProps: { ...this.state.volumeProps, memoryAllocated: parseInt( e.currentTarget.value ) } } )}
            />
            <FormHelperText id="mt-volume-memory-error">{formatBytes( this.state.volumeProps.memoryAllocated || 0 )}</FormHelperText>
          </FormControl>
        </div>
      </Container>
    );
  }
}

const Container = styled.div`
  padding: 20px;
`;