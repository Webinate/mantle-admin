import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { default as styled } from '../../theme/styled';

export type Props = {
}

export type State = {
  activeStep: number;
}

export class NewVolumeForm extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      activeStep: 0
    };
  }

  handleNext = () => {
    const { activeStep } = this.state;
    this.setState( {
      activeStep: activeStep + 1,
    } );
  };

  handleBack = () => {
    const { activeStep } = this.state;
    this.setState( {
      activeStep: activeStep - 1,
    } );
  }

  render() {
    const steps = [
      'Select Volume Type',
      'Setup Volume Properties',
      'Set User Permissions'
    ];

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