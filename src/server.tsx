import * as React from 'react';
import { StaticRouter } from 'react-router';
import {Express} from 'express';
import {Db} from 'mongodb';
import {Provider} from 'react-redux';
import {IRootState} from './store';
import {App} from './containers/app';
import {Routes} from './components/routes';
import createStore from './utils/createStore';
const ReactDOMServer = require('react-dom/server');

/**
 * The default entry point for the admin server
 */
export default class Server {
  constructor() {

  }

  async initialize(app: Express, db: Db) {
    const context: { url?: string } = { }

    app.use("*", function(req, res) {
      const initialState: Partial<IRootState> = {
        countState: { count: 20, busy: false }
      };
      const store = createStore( initialState );
      let html = ReactDOMServer.renderToString(
        <Provider store={store}>
          <App>
            <StaticRouter
              location={req.url}
              context={context}
            >
              <Routes />
            </StaticRouter>
          </App>
        </Provider>
      );

      if (context.url) {
        res.writeHead(301, {
          Location: context.url,
        });
        res.end();
        return;
      }

      // Grab the initial state from our Redux store
      // const state = store.getState();
      html = html.replace( '{{{INITIAL_STATE}}}', JSON.stringify(initialState).replace(/</g, '\\u003c') );
      res.send( 200, html );
    })
  }
}