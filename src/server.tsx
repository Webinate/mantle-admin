/// <reference path="./material-v1-fixes.d.ts" />

import * as React from 'react';
import { StaticRouter } from 'react-router';
import * as express from 'express';
import { hydrate } from './server/hydrate';
import { Db } from 'mongodb';
import { Provider } from 'react-redux';
import { IRootState } from './store';
import createStore from './utils/createStore';
import HTML from './components/html';
import { apiUrl } from './utils/httpClients';
import createHistory from 'history/createMemoryHistory';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { Controller } from '../../../src';
import { IAuthReq, IClient } from '../../../src';
import { authentication, serializers } from '../../../src';
import { MuiThemeProvider, createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';
import Theme from './theme/mui-theme';
import { ServerStyleSheet } from 'styled-components';
import { SheetsRegistry } from 'react-jss/lib/jss';
import JssProvider from 'react-jss/lib/JssProvider';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateUtils from 'material-ui-pickers/utils/date-fns-utils';

// Needed for onTouchTap
import { Action } from 'redux';
import { RedirectError } from './server/errors';

/**
 * The default entry point for the admin server
 */
export default class MainController extends Controller {

  constructor( client: IClient ) {
    super( null );
  }

  async initialize( app: express.Express, db: Db ) {
    await Promise.all( [
      super.initialize( app, db ),
      new serializers.auth( {
        rootPath: apiUrl,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password'
      } ).initialize( app, db ),
      new serializers.user( {
        rootPath: apiUrl
      } ).initialize( app, db ),
      new serializers.posts( {
        rootPath: apiUrl
      } ).initialize( app, db ),
      new serializers.categories( {
        rootPath: apiUrl
      } ).initialize( app, db ),
      new serializers.volume( {
        rootPath: apiUrl
      } ).initialize( app, db )
    ] );

    const router = express.Router();
    router.get( '*', [ authentication.identifyUser, this.renderPage.bind( this ) ] );
    app.use( '/', router );
    return this;
  }

  /**
   * Draws the html page and its initial react state and component tree
   */
  private async renderPage( req: IAuthReq, res: express.Response, next: Function ) {
    const context: { url?: string } = {}
    const history = createHistory();
    let url = req.url;
    let user = req._user;

    if ( !user && ( url !== '/login' && url !== '/register' ) )
      return res.redirect( '/login' );
    else if ( user && ( url === '/login' || url === '/register' ) )
      return res.redirect( '/' );

    let initialState: Partial<IRootState> = {}
    const muiAgent = req.headers[ 'user-agent' ];
    const store = createStore( initialState, history );
    const theme = createMuiTheme( Theme );

    let actions: Action[];
    try {
      actions = await hydrate( req );
    }
    catch ( err ) {
      if ( err instanceof RedirectError )
        return res.redirect( err.redirect );

      return this.renderError( res, err );
    }

    try {
      for ( const action of actions )
        store.dispatch( action );

      // For styled components
      const sheet = new ServerStyleSheet();

      // For material ui
      const materialSheets = new SheetsRegistry();
      const generateClassName = createGenerateClassName();

      // We use a require to support hot reloading
      const App = require( './containers/app' ).App;

      let html = renderToString( sheet.collectStyles(
        <Provider store={store}>
          <JssProvider registry={materialSheets} generateClassName={generateClassName}>
            <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
              <StaticRouter location={url} context={context}>
                <MuiPickersUtilsProvider utils={DateUtils}>
                  <App {...{} as any} />
                </MuiPickersUtilsProvider>
              </StaticRouter>
            </MuiThemeProvider>
          </JssProvider>
        </Provider>
      ) );

      const styleTags = sheet.getStyleElement();

      // Get the style sheet for material
      const styleTagsMaterial = materialSheets.toString()


      // Check the context if there needs to be a redirect
      if ( context.url ) {
        res.writeHead( 301, {
          Location: context.url,
        } );
        res.end();
        return;
      }

      initialState = store.getState();
      html = renderToStaticMarkup( <HTML html={html} styles={styleTags} stylesMaterial={styleTagsMaterial} intialData={initialState} agent={muiAgent} /> );
      res.send( html );
    }
    catch ( err ) {
      this.renderError( res, err );
    }
  }

  private renderError( res: express.Response, err: Error ) {
    res.status( 500 );
    res.send( renderToStaticMarkup(
      <html>
        <body>
          <div>An Error occurred while rendering the application: {err.message}</div>
          <div>Stack Trace: {err.stack}</div>
        </body>
      </html>
    ) );
  }
}