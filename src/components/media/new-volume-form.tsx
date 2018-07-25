import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { default as styled } from '../../theme/styled';
import { IVolume } from '../../../../../src';
import VolumeProperties from './volume-properties';
import StepContent from '@material-ui/core/StepContent';
import StorageIcon from '@material-ui/icons/Storage';
import CloudIcon from '@material-ui/icons/CloudCircle';

export type Props = {
  onComplete: ( volume: Partial<IVolume<'client'>> ) => void;
}

export type State = {
  activeStep: number;
  activeVolumeType: number;
  newVolume: Partial<IVolume<'client'>>;
}

export class NewVolumeForm extends React.Component<Props, State> {

  private _steps: string[];
  private _volumeTypes: {
    icon: JSX.Element;
    heading: string;
    description: string;
  }[];

  constructor( props: Props ) {
    super( props );
    this._steps = [
      'Select Volume Type',
      'Setup Volume Properties',
      'Set User Permissions'
    ];

    this._volumeTypes = [
      { icon: <StorageIcon />, heading: 'Local Storage', description: 'This is local storage' },
      { icon: <CloudIcon />, heading: 'Google Storage', description: 'This is google storage' }
    ];

    this.state = {
      activeStep: 0,
      activeVolumeType: 0,
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

  renderStage1() {
    return (
      <VolumeTypes>
        {this._volumeTypes.map( ( type, index ) => {
          return (
            <div className="mt-volume-types" key={`type=${ index }`}>
              <div>
                <Button
                  variant="fab"
                  color={this.state.activeVolumeType === index ? 'primary' : undefined}
                  onClick={e => this.setState( { activeVolumeType: index } )}
                >
                  {type.icon}
                </Button>
              </div>
              <div>
                <h2>{type.heading}</h2>
                {type.description}
              </div>
            </div>
          );
        } )}
      </VolumeTypes>
    );
  }

  render() {
    const steps = this._steps;
    const activeStep = this.state.activeStep;

    let activeElm: JSX.Element;
    if ( activeStep === 0 )
      activeElm = this.renderStage1();
    else if ( activeStep === 1 )
      activeElm = <VolumeProperties />;
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