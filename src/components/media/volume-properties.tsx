import * as React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { IVolume } from '../../../../../src';
import { default as styled } from '../../theme/styled';

export type Props = {
}

export type State = {
  volumeProps: Partial<IVolume<'client'>>
}

export default class NewVolumeForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      volumeProps: {
        name: 'New Volume'
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
              value={this.state.volumeProps.name}
              onChange={e => this.setState( { volumeProps: { ...this.state.volumeProps, name: e.currentTarget.value } } )}
            />
            <FormHelperText id="mt-volume-name-error"></FormHelperText>
          </FormControl>
        </div>
        <div>
          <FormControl>
            <InputLabel htmlFor="mt-volume-memory">Memory Used</InputLabel>
            <Input
              id="mt-volume-memory"
              value={this.state.volumeProps.memoryUsed}
              onChange={e => this.setState( { volumeProps: { ...this.state.volumeProps, memoryUsed: parseInt( e.currentTarget.value ) } } )}
            />
            <FormHelperText id="mt-volume-name-error"></FormHelperText>
          </FormControl>
        </div>
      </Container>
    );
  }
}

const Container = styled.div`
  padding: 20px;
`;