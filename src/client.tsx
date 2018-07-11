import * as React from 'react';
import { hydrate } from 'react-dom';
import { ConnectedRouter } from './utils/connectedRouter';
import { App } from './containers/app';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateUtils from 'material-ui-pickers/utils/date-fns-utils';
import { Provider } from 'react-redux';
import createStore from './utils/createStore';
import { IRootState } from './store';
import createHistory from 'history/createBrowserHistory';
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';
import Theme from './theme/mui-theme';
import JssProvider from 'react-jss/lib/JssProvider';
// import { create } from 'jss';
// import { jssPreset } from '@material-ui/core/styles';

const props = ( window as any ).PROPS;
const history = createHistory();
const store = createStore( props as IRootState, history );
const mountNode = document.getElementById( 'application' );

const theme = createMuiTheme( Theme );
// const jss = create(jssPreset());
const generateClassName = createGenerateClassName();

export const app = hydrate(
  <Provider store={store}>
    <JssProvider generateClassName={generateClassName}>
      <MuiThemeProvider theme={theme}>
        <ConnectedRouter store={store} history={history}>
          <MuiPickersUtilsProvider utils={DateUtils} >
            <App {...{} as any} />
          </MuiPickersUtilsProvider>
        </ConnectedRouter>
      </MuiThemeProvider>
    </JssProvider>
  </Provider >, mountNode
);

