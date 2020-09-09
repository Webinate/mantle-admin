import * as React from 'react';
import { Element } from 'mantle';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

export type Props = {
  selectedElement: Element;
  style: any;
  onChange: (style: any) => void;
};

type State = {
  style: any;
};

export default class ImageEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      style: { ...props.style },
    };
  }

  private onBlur() {
    const thisStyle = this.state.style || {};
    const propStyle = this.props.style || {};
    let hasChanged = false;

    if (thisStyle['max-width'] !== propStyle['max-width']) hasChanged = true;
    if (thisStyle['max-height'] !== propStyle['max-height']) hasChanged = true;
    if (thisStyle.float !== propStyle.float) hasChanged = true;

    if (hasChanged) this.props.onChange(this.state.style);
  }

  render() {
    return (
      <div>
        <TextField
          id="mt-image-width"
          value={this.state.style['max-width']}
          fullWidth={true}
          helperText="width"
          onBlur={(e) => this.onBlur()}
          onChange={(e) =>
            this.setState({
              style: { ...this.state.style, 'max-width': e.currentTarget.value ? e.currentTarget.value : undefined },
            })
          }
        />
        <TextField
          id="mt-image-height"
          value={this.state.style['max-height']}
          fullWidth={true}
          helperText="height"
          onBlur={(e) => this.onBlur()}
          onChange={(e) =>
            this.setState({
              style: { ...this.state.style, 'max-height': e.currentTarget.value ? e.currentTarget.value : undefined },
            })
          }
        />
        <FormControl fullWidth={true}>
          <Select
            className="mt-image-float"
            value={this.state.style.float || ''}
            fullWidth={true}
            onChange={(e) => {
              let floatVal: 'left' | 'right' | undefined = undefined;
              if (e.currentTarget.textContent === 'Left') floatVal = 'left';
              else if (e.currentTarget.textContent === 'Right') floatVal = 'right';

              this.setState({ style: { ...this.state.style, float: floatVal } }, () => {
                this.onBlur();
              });
            }}
          >
            <MenuItem id="mt-image-float-left" value="left">
              Left
            </MenuItem>
            <MenuItem id="mt-image-float-right" value="right">
              Right
            </MenuItem>
            <MenuItem id="mt-image-float-none" value="">
              None
            </MenuItem>
          </Select>
          <FormHelperText>Float</FormHelperText>
        </FormControl>
      </div>
    );
  }
}
