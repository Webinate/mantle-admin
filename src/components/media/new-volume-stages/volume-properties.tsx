import * as React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { IVolume } from '../../../../../../src';
import { default as styled } from '../../../theme/styled';
import { formatBytes } from '../../../utils/component-utils';

export type Props = {
  isAdmin: boolean;
  volume: Partial<IVolume<'client'>>;
  onChange: ( props: Partial<IVolume<'client'>> ) => void;
  maxValue: number;
}

export type State = {
}

export default class NewVolumeForm extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
    };
  }

  private formatMemory( val: string ) {
    const toRet = parseInt( val );
    if ( isNaN( toRet ) )
      return 0;

    return toRet;
  }

  render() {

    let memElm: JSX.Element | null = null;;
    let memError = false;

    if ( this.props.volume.memoryAllocated === 0 ) {
      memError = true;
      memElm = <FormHelperText id="mt-volume-memory-error">
        Allocated memory cannot be 0
      </FormHelperText>
    }
    else if ( this.props.volume.memoryAllocated! > this.props.maxValue ) {
      memError = true;
      memElm = <FormHelperText id="mt-volume-memory-error">
        <b>{formatBytes( this.props.volume.memoryAllocated! )}</b> - Allocated memory cannot be greater than {formatBytes( this.props.maxValue )}
      </FormHelperText>
    }
    else {
      memElm = <FormHelperText id="mt-volume-memory-error">
        {formatBytes( this.props.volume.memoryAllocated || 0 )}
      </FormHelperText>
    }

    return (
      <Container>
        <div>
          <FormControl
            error={!this.props.volume.name ? true : false}
          >
            <InputLabel htmlFor="mt-volume-name">Volume Name</InputLabel>
            <Input
              id="mt-volume-name"
              autoFocus={true}
              value={this.props.volume.name}
              onChange={e => this.props.onChange( { name: e.currentTarget.value } )}
            />
            {!this.props.volume.name ? <FormHelperText id="mt-volume-name-error">Name cannot be empty</FormHelperText> : undefined}
          </FormControl>
        </div>
        <div>
          <FormControl
            disabled={!this.props.isAdmin}
            error={memError}
          >
            <InputLabel htmlFor="mt-volume-memory">Memory Allocated</InputLabel>
            <Input
              id="mt-volume-memory"
              value={this.props.volume.memoryAllocated}
              onChange={e => this.props.onChange( { memoryAllocated: this.formatMemory( e.currentTarget.value ) } )}
            />
            {memElm}
          </FormControl>
        </div>
      </Container>
    );
  }
}

const Container = styled.div`
  padding: 0 0 0 20px;

  > div {
    margin: 30px 0 0 0;
  }
`;