import { ThemeInterface } from './theme';

// 100 = lighter colour -> 500 = deeper color

// Purples
const p100 = '#8885A7';
const p200 = '#6d689c';

// Reds
const s100 = '#B64545';
const s200 = '#CC7A7A';

// Lights BGs
const l100 = '#fff';
const l200 = '#f3f3f3';
const l300 = '#eee';
const l400 = '#ddd';

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */
export default {
  primaryColor: '',
  primaryColorInverted: '',

  // Purples
  primary100: { color: '#fff', softColor: '#eee', background: p100, border: '#ccc' },
  primary200: { color: '#fff', softColor: '#eee', background: p200, border: '#ccc' },

  // Reds
  secondary100: { color: '#fff', softColor: '#eee', background: s100, border: '#ccc' },
  secondary200: { color: '#fff', softColor: '#eee', background: s200, border: '#835151' },

  // Light
  light100: { color: '#333', softColor: '#aaa', background: l100, border: '#ddd' },
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
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 2,
  palette: {
    primary1Color: p100,
    primary2Color: '#0288D1',
    primary3Color: '#BDBDBD',
    accent1Color: '#FF4081',
    accent2Color: '#F5F5F5',
    accent3Color: '#9E9E9E',
    textColor: '#000',
    secondaryTextColor: 'rgba(0,0,0,0.54)',
    alternateTextColor: '#fff',
    canvasColor: '#fff',
    borderColor: '#E0E0E0',
    disabledColor: 'rgba(0,0,0,0.3)',
    pickerHeaderColor: '#0D47A1',
    clockCircleColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#000'
  },

} as ThemeInterface;