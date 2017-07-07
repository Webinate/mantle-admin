import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ConnectedRouter } from './utils/connectedRouter';
import { App } from './containers/app';
import { Provider } from 'react-redux';
import createStore from './utils/createStore';
import { IRootState } from './store';
import createHistory from 'history/createBrowserHistory';

const props = ( window as any ).PROPS;
const history = createHistory();
const store = createStore( props as IRootState, history );
const mountNode = document.getElementById( 'application' );

// export const app = ReactDOM.render(
//   <Provider store={store}>
//     <ConnectedRouter store={store} history={history} >
//       <App>
//         <Routes onGoTo={e => {
//           store.dispatch( push( '/topics' ) );
//         }} />

//       </App>
//     </ConnectedRouter >
//   </Provider>, document as any
// );

export const app = ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter store={store} history={history}>
      <App />
    </ConnectedRouter>
  </Provider>, mountNode
);

