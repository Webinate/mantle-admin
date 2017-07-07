import * as React from 'react';
import { StaticRouter } from 'react-router';
import { Express } from 'express';
import { Db } from 'mongodb';
import { Provider } from 'react-redux';
import { IRootState } from './store';
import { App } from './containers/app';
import createStore from './utils/createStore';
import { HTML } from './utils/html';
import createHistory from 'history/createMemoryHistory';
const ReactDOMServer = require( 'react-dom/server' );

/**
 * The default entry point for the admin server
 */
export default class Server {
  constructor() {

  }

  async initialize( app: Express, db: Db ) {
    const context: { url?: string } = {}
    const history = createHistory();

    app.use( "/", function( req, res, next ) {
      let url = req.url;
      let initialState: Partial<IRootState> = {
        countState: { count: 20, busy: false }
      };

      const store = createStore( initialState, history );
      let html = ReactDOMServer.renderToString(
        <Provider store={store}>
          <StaticRouter location={url} context={context}>
            <App />
          </StaticRouter>
        </Provider>
      );

      // Check the context if there needs to be a redirect
      if ( context.url ) {
        res.writeHead( 301, {
          Location: context.url,
        } );
        res.end();
        return;
      }

      initialState = store.getState();
      html = ReactDOMServer.renderToStaticMarkup( <HTML html={html} intialData={initialState} /> );
      res.send( 200, html );
    } )
  }
}