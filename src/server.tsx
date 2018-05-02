import * as React from 'react';
import { StaticRouter } from 'react-router';
import * as express from 'express';
import { hydrate } from './server/hydrate';
import { Db } from 'mongodb';
import { Provider } from 'react-redux';
import { IRootState } from './store';
import { App } from './containers/app';
import createStore from './utils/createStore';
import { HTML } from './components/html';
import { apiUrl } from './utils/httpClients';
import createHistory from 'history/createMemoryHistory';
const ReactDOMServer = require( 'react-dom/server' );
import { Controller } from 'modepress';
import { IAuthReq, IClient } from 'modepress';
import { authentication, serializers } from 'modepress';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import Theme from './theme/mui-theme';
import { ServerStyleSheet } from 'styled-components';

// Needed for onTouchTap
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { Action } from 'redux';
import { RedirectError } from './server/errors';
injectTapEventPlugin();

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
    const theme = getMuiTheme( Theme, { userAgent: muiAgent } );

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

      const sheet = new ServerStyleSheet();
      let html = ReactDOMServer.renderToString( sheet.collectStyles(
        <Provider store={store}>
          <MuiThemeProvider muiTheme={theme}>
            <StaticRouter location={url} context={context}>
              <App {...{} as any} />
            </StaticRouter>
          </MuiThemeProvider>
        </Provider>
      ) );

      const styleTags = sheet.getStyleElement();

      // Check the context if there needs to be a redirect
      if ( context.url ) {
        res.writeHead( 301, {
          Location: context.url,
        } );
        res.end();
        return;
      }

      initialState = store.getState();
      html = ReactDOMServer.renderToStaticMarkup( <HTML html={html} styles={styleTags} intialData={initialState} agent={muiAgent} /> );
      res.send( html );
    }
    catch ( err ) {
      this.renderError( res, err );
    }
  }

  private renderError( res: express.Response, err: Error ) {
    res.status( 500 );
    res.send( ReactDOMServer.renderToStaticMarkup(
      <html>
        <body>
          <div>An Error occurred while rendering the application: {err.message}</div>
          <div>Stack Trace: {err.stack}</div>
        </body>
      </html>
    ) );
  }
}