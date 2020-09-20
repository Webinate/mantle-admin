import * as React from 'react';
import { hydrate } from 'react-dom';
import { ConnectedRouter } from './utils/connectedRouter';
import App from './containers/app';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Provider } from 'react-redux';
import createStore from './utils/createStore';
import { IRootState } from './store';
import createHistory from 'history/createBrowserHistory';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Theme from './theme/mui-theme';

const props = (window as any).PROPS;
const history = createHistory();
const store = createStore(props as IRootState, history);
const mountNode = document.getElementById('application');
const theme = createMuiTheme(Theme);

const state: IRootState = store.getState();
console.log(`Welcome to Mantle`);
console.log(`Debug Mode: ${state.app.debugMode}`);

export const app = hydrate(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConnectedRouter store={store} history={history}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <App />
        </MuiPickersUtilsProvider>
      </ConnectedRouter>
    </ThemeProvider>
  </Provider>,
  mountNode
);
