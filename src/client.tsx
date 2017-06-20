import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App} from './containers/app';
import {Routes} from './components/routes';
import {Provider} from 'react-redux';
import createStore from './utils/createStore';
import {IRootState} from './store';
//import history from './utils/createHistory';
//import { ConnectedRouter } from 'react-router-redux';

const props = (window as any).PROPS;
const store = createStore( props as IRootState );

export const app = ReactDOM.render(
  <Provider store={store}>
    <App>
      <BrowserRouter >
        <Routes />
      </BrowserRouter>
    </App>
  </Provider>, document as any
);