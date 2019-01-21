import { ThemeInterface } from './theme';

// 100 = lighter colour -> 500 = deeper color

// Purples
const p100 = '#8885A7';
const p200 = '#6d689c';
const p300 = '#4d496f';

// Reds
const s100 = '#fad1d1';
const s200 = '#CC7A7A';
const s300 = '#B64545';

// Lights BGs
const l100 = '#fff';
const l200 = '#f3f3f3';
const l300 = '#eee';
const l400 = '#ddd';

// Error
const error = '#ce3131';
const warning = '#fcbe7d';

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */
export default {
  primaryColor: '',
  primaryColorInverted: '',

  additionalColors: {
    light: '#777'
  },

  // Purples
  primary100: { color: '#fff', softColor: '#eee', background: p100, border: '#6d6993' },
  primary200: { color: '#fff', softColor: '#eee', background: p200, border: '#ccc' },
  primary300: { color: '#fff', softColor: '#eee', background: p300, border: '#36334e' },

  // Reds
  secondary100: { color: '#333', softColor: '#333', background: s100, border: '#efabab' },
  secondary200: { color: '#fff', softColor: '#eee', background: s200, border: '#835151' },
  secondary300: { color: '#fff', softColor: '#eee', background: s300, border: '#ccc' },

  // Warnings & Errors
  error: { color: '#fff', softColor: '#fff', background: error, border: '#ad2828' },
  warning: { color: '#ca7f30', softColor: '#ca7f30', background: warning, border: '#dfa76d' },

  // Light
  light100: { color: '#333', softColor: '#ccc', background: l100, border: '#ddd' },
  light200: { color: '#333', softColor: '#aaa', background: l200, border: '#ddd' },
  light300: { color: '#333', softColor: '#aaa', background: l300, border: '#ddd' },
  light400: { color: '#333', softColor: '#aaa', background: l400, border: '#ccc' },

  typography: {
    fontSize: 16,
    fontWeightRegular: 'lighter'
  },
  overrides: {
    MuiInput: {
      underline: {
        color: p200,
        '&:hover:not($disabled):after': {
          borderBottomColor: p100
        },
        '&:hover:not($disabled):before': {
          borderBottomColor: p100
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottomColor: p200
        },
        '&:hover:not($disabled):not($focused):not($error):after': {
          borderBottomColor: p200
        }
      }
    }
  },
  palette: {
    primary: { main: p200 },
    secondary: { main: s200 },
    error: { main: error }
  }
} as ThemeInterface;