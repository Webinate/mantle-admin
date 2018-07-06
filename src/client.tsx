import * as React from 'react';
import { hydrate } from 'react-dom';
import { ConnectedRouter } from './utils/connectedRouter';
import { App } from './containers/app';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateUtils from 'material-ui-pickers/utils/moment-utils';
import { Provider } from 'react-redux';
import createStore from './utils/createStore';
import { IRootState } from './store';
import createHistory from 'history/createBrowserHistory';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Theme from './theme/mui-theme';

const props = ( window as any ).PROPS;
const history = createHistory();
const store = createStore( props as IRootState, history );
const mountNode = document.getElementById( 'application' );

const theme = createMuiTheme( Theme );

export const app = hydrate(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <ConnectedRouter store={store} history={history}>
        <MuiPickersUtilsProvider utils={DateUtils} >
          <App {...{} as any} />
        </MuiPickersUtilsProvider>
      </ConnectedRouter>
    </MuiThemeProvider>
  </Provider >, mountNode
);

