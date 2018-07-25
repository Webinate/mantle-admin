import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { default as styled } from '../../theme/styled';
import { IVolume } from 'modepress/src';

export type Props = {
  onComplete: ( volume: Partial<IVolume<'client'>> ) => void;
}

export type State = {
  activeStep: number;
  newVolume: Partial<IVolume<'client'>>;
}

export class NewVolumeForm extends React.Component<Props, State> {

  private _steps: string[];

  constructor( props: Props ) {
    super( props );
    this._steps = [
      'Select Volume Type',
      'Setup Volume Properties',
      'Set User Permissions'
    ];

    this.state = {
      activeStep: 0,
      newVolume: {
        name: 'New Volume',
        type: 'local'
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

  render() {
    const steps = this._steps;

    const activeStep = this.state.activeStep;

    return (
      <div style={{ margin: '30px' }}>
        <Paper>
          <Stepper activeStep={activeStep}>
            {steps.map( ( label, index ) => {
              return (
                <Step key={label} completed={index < activeStep}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            } )}
          </Stepper>
        </Paper>
        <Buttons>
          <Button
            disabled={activeStep === 0}
            onClick={e => this.handleBack()}
          >
            Back
          </Button>
          <Button
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