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

  private formatMemory( val: string ) {
    const toRet = parseInt( val );
    if ( isNaN( toRet ) )
      return 0;

    return toRet;
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
          <FormControl
            disabled={!this.props.isAdmin}
            error={this.state.volumeProps.memoryAllocated === 0 ? true : false}
          >
            <InputLabel htmlFor="mt-volume-memory">Memory Allocated</InputLabel>
            <Input
              id="mt-volume-memory"
              value={this.state.volumeProps.memoryAllocated}
              onChange={e => this.setState( { volumeProps: { ...this.state.volumeProps, memoryAllocated: this.formatMemory( e.currentTarget.value ) } } )}
            />
            <FormHelperText id="mt-volume-memory-error">
              {this.state.volumeProps.memoryAllocated === 0 ? 'Allocated memory cannot be 0' : formatBytes( this.state.volumeProps.memoryAllocated || 0 )}
            </FormHelperText>
          </FormControl>
        </div>
      </Container>
    );
  }
}

const Container = styled.div`
  padding: 20px;
`;