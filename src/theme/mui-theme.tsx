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

  spacing: {
    iconSize: 24,
    desktopGutter: 24,
    desktopGutterMore: 32,
    desktopGutterLess: 16,
    desktopGutterMini: 8,
    desktopKeylineIncrement: 64,
    desktopDropDownMenuItemHeight: 32,
    desktopDropDownMenuFontSize: 15,
    desktopDrawerMenuItemHeight: 48,
    desktopSubheaderHeight: 48,
    desktopToolbarHeight: 56,
  },
  svgIcon: {
    color: p200
  },
  icon: {
    color: p200
  },
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 2,
  palette: {
    primary: { main: p200 },
    secondary: { main: s200},
    error: {main: error},
    primary1Color: p200,
    primary2Color: '#0288D1',
    primary3Color: '#BDBDBD',
    accent1Color: '#FF4081',
    accent2Color: '#F5F5F5',
    accent3Color: '#9E9E9E',
    textColor: '#333',
    secondaryTextColor: 'rgba(0,0,0,0.54)',
    alternateTextColor: '#fff',
    canvasColor: '#fff',
    borderColor: '#E0E0E0',
    disabledColor: 'rgba(0,0,0,0.3)',
    pickerHeaderColor: '#0D47A1',
    clockCircleColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#000'
  },
  datePicker: {
    headerColor: p200,
    selectColor: p200
  }

} as ThemeInterface;