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
import { Controller } from 'modepress-api';
import { IAuthReq } from 'modepress';
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";

/**
 * The default entry point for the admin server
 */
export default class MainController extends Controller {
  constructor() {
    super( null );
  }

  async initialize( app: Express, db: Db ) {
    const context: { url?: string } = {}
    const history = createHistory();

    app.use( "/", function( req, res, next ) {
      let url = req.url;
      let user = ( req as Express.Request as IAuthReq )._user;

      if ( !user && url !== '/login' )
        return res.redirect( '/login' );
      else if ( user && url === '/login' )
        return res.redirect( '/' );

      let initialState: Partial<IRootState> = {
        countState: { count: 20, busy: false },
        authentication: { authenticated: user ? true : false }
      };

      const store = createStore( initialState, history );
      const theme = getMuiTheme();

      let html = ReactDOMServer.renderToString(
        <Provider store={store}>
          <MuiThemeProvider muiTheme={theme}>
            <StaticRouter location={url} context={context}>
              <App />
            </StaticRouter>
          </MuiThemeProvider>
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

    return this;
  }
}