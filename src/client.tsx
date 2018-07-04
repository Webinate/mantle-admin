import * as React from 'react';
import { hydrate } from 'react-dom';
import { ConnectedRouter } from './utils/connectedRouter';
import { App } from './containers/app';
import { Provider } from 'react-redux';
import createStore from './utils/createStore';
import { IRootState } from './store';
import createHistory from 'history/createBrowserHistory';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import Theme from './theme/mui-theme';

const props = ( window as any ).PROPS;
const history = createHistory();
const store = createStore( props as IRootState, history );
const mountNode = document.getElementById( 'application' );

const theme = getMuiTheme( Theme, { userAgent: ( window as any ).AGENT } );

export const app = hydrate(
  < Provider store={store} >
    <MuiThemeProvider muiTheme={theme}>
      <ConnectedRouter store={store} history={history}>
        <App {...{} as any} />
      </ConnectedRouter>
    </MuiThemeProvider>
  </Provider >, mountNode
);

