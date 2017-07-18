import * as React from 'react';
import { StaticRouter } from 'react-router';
import * as express from 'express';
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
import { authentication } from 'modepress-api';
import { MuiThemeProvider, getMuiTheme } from "material-ui/styles";
import Theme from "./utils/theme";

// Needed for onTouchTap
import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

/**
 * The default entry point for the admin server
 */
export default class MainController extends Controller {
  constructor() {
    super( null );
  }

  async initialize( app: express.Express, db: Db ) {
    await super.initialize( app, db );

    const router = express.Router();
    router.get( '*', [ authentication.identifyUser, this.renderPage.bind( this ) ] );
    app.use( '/', router );
    return this;
  }

  /**
   * Draws the html page and its initial react state and component tree
   */
  private renderPage( req: express.Request, res: express.Response, next: Function ) {
    const context: { url?: string } = {}
    const history = createHistory();
    let url = req.url;
    let user = ( req as Express.Request as IAuthReq )._user;

    if ( !user && ( url !== '/login' && url !== '/register' ) )
      return res.redirect( '/login' );
    else if ( user && ( url === '/login' || url === '/register' ) )
      return res.redirect( '/' );

    let initialState: Partial<IRootState> = {
      countState: { count: 20, busy: false },
      authentication: {
        authenticated: user ? true : false,
        busy: false
      }
    };

    const muiAgent = req.headers[ 'user-agent' ];
    const store = createStore( initialState, history );
    const theme = getMuiTheme( Theme, { userAgent: muiAgent } );

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
    html = ReactDOMServer.renderToStaticMarkup( <HTML html={html} intialData={initialState} agent={muiAgent} /> );
    res.send( 200, html );
  }
}