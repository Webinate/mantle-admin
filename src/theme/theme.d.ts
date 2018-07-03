import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

export type ThemeValue = {
  color: string;
  softColor: string;
  background: string;
  border: string;
}

export interface ThemeInterface extends ThemeOptions {
  primaryColor: string;
  primaryColorInverted: string;

  primary100: ThemeValue;
  primary200: ThemeValue;
  primary300: ThemeValue;
  secondary100: ThemeValue;
  secondary200: ThemeValue;
  secondary300: ThemeValue;
  error: ThemeValue;
  warning: ThemeValue;
  light100: ThemeValue;
  light200: ThemeValue;
  light300: ThemeValue;
  light400: ThemeValue;
}