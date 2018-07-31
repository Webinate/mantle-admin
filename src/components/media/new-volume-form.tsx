import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { default as styled } from '../../theme/styled';
import { IVolume } from '../../../../../src';
import VolumeProperties from './new-volume-stages/volume-properties';
import StepContent from '@material-ui/core/StepContent';
import VolumeType from './new-volume-stages/volume-type';

export type Props = {
  onComplete: ( volume: Partial<IVolume<'client'>> ) => void;
  isAdmin: boolean;
}

export type State = {
  activeStep: number;
  activeVolumeType: number;
  nextEnabled: boolean;
  newVolume: Partial<IVolume<'client'>>;
}

export class NewVolumeForm extends React.Component<Props, State> {

  private _steps: string[];
  private static MAX = 1 * 1024 * 1024 * 1024; // 1 Gig

  constructor( props: Props ) {
    super( props );
    this._steps = [
      'Select Volume Type',
      'Setup Volume Properties',
      'Set User Permissions'
    ];

    this.state = {
      activeStep: 0,
      activeVolumeType: 0,
      nextEnabled: true,
      newVolume: {
        name: 'New Volume',
        type: 'local',
        memoryAllocated: 500 * 1024 * 1024
      }
    };
  }

  handleNext = () => {
    const { activeStep } = this.state;

    if ( activeStep < this._steps.length - 1 )
      this.setState( {
        activeStep: activeStep + 1,
      } );
    else
      this.props.onComplete( this.state.newVolume );
  };

  handleBack = () => {
    const { activeStep } = this.state;

    if ( activeStep > 0 )
      this.setState( {
        activeStep: activeStep - 1,
      } );
  }

  private onChange( newVolue: Partial<IVolume<'client'>> ) {
    const updatedVolume = { ...this.state.newVolume, ...newVolue };
    this.setState( { newVolume: updatedVolume } );

    // Validation
    if ( updatedVolume.name!.trim() === '' )
      this.setState( { nextEnabled: false } );
    else if ( updatedVolume.memoryAllocated! <= 0 || updatedVolume.memoryAllocated! >= NewVolumeForm.MAX )
      this.setState( { nextEnabled: false } );
    else
      this.setState( { nextEnabled: true } );
  }

  render() {
    const steps = this._steps;
    const activeStep = this.state.activeStep;

    let activeElm: JSX.Element;
    if ( activeStep === 0 )
      activeElm = <VolumeType
        volume={this.state.newVolume}
        onChange={v => this.onChange( v )}
      />
    else if ( activeStep === 1 )
      activeElm = <VolumeProperties
        maxValue={NewVolumeForm.MAX}
        volume={this.state.newVolume}
        isAdmin={this.props.isAdmin}
        onChange={v => this.onChange( v )}
      />;
    else
      activeElm = <div></div>;

    return (
      <div style={{ margin: '30px' }}>
        <Paper style={{ overflow: 'auto' }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map( ( label, index ) => {
              return (
                <Step key={label} completed={index < activeStep}>
                  <StepLabel className="mt-vol-step-label">{label}</StepLabel>
                  <StepContent>{activeElm}</StepContent>
                </Step>
              );
            } )}
          </Stepper>
        </Paper>
        <Buttons>
          <Button
            id="mt-vol-back"
            disabled={activeStep === 0}
            onClick={e => this.handleBack()}
          >
            Back
          </Button>
          <Button
            id="mt-vol-next"
            disabled={!this.state.nextEnabled}
            variant="contained"
            color="primary"
            onClick={e => this.handleNext()}
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Buttons>
      </div>
    );
  }
}

const Buttons = styled.div`
  margin: 20px 0;
  button {
    margin: 0 5px 0 0;
  }
`;
