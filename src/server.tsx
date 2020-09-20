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
import { Router } from '../../../src/routers/router';
import { FileRouter } from '../../../src/routers/file';
import { AuthRouter } from '../../../src/routers/auth';
import { ThemeProvider, ServerStyleSheets, createMuiTheme } from '@material-ui/core/styles';
import Theme from './theme/mui-theme';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import * as DateFnsUtils from '@date-io/date-fns';
import { User as UserModel } from '../../../src/graphql/models/user-type';
import { User } from 'mantle';

// Needed for onTouchTap
import { Action } from 'redux';
import { RedirectError } from './server/errors';
import controllerFactory from '../../../src/core/controller-factory';
import { IClient } from '../../../src/types/config/properties/i-client';

/**
 * The default entry point for the admin server
 */
export default class MainController extends Router {
  constructor(client: IClient) {
    super();
  }

  async initialize(app: express.Express, db: Db) {
    await Promise.all([
      super.initialize(app, db),
      new AuthRouter({
        rootPath: apiUrl,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password',
      }).initialize(app, db),
      new FileRouter({
        rootPath: apiUrl,
      }).initialize(app, db),
    ]);

    const router = express.Router();
    router.get('*', [this.renderPage.bind(this)]);
    app.use('/', router);
    return this;
  }

  /**
   * Draws the html page and its initial react state and component tree
   */
  private async renderPage(req: express.Request, res: express.Response, next: Function) {
    // Get current session
    const session = await controllerFactory.get('sessions').getSession(req);
    if (session) await controllerFactory.get('sessions').setSessionHeader(session, req, res);

    const context: { url?: string } = {};
    const history = createHistory();
    let url = req.url;
    let user = session?.user || null;

    if (!user && url !== '/login' && url !== '/register') return res.redirect('/login');
    else if (user && (url === '/login' || url === '/register')) return res.redirect('/');

    let initialState: Partial<IRootState> = {};
    const muiAgent = req.headers['user-agent'];
    const store = createStore(initialState, history);
    const theme = createMuiTheme(Theme);

    let actions: Action[];
    try {
      actions = await hydrate(req.url, user ? (UserModel.fromEntity(user) as User) : null);
    } catch (err) {
      if (err instanceof RedirectError) return res.redirect(err.redirect);

      return this.renderError(res, err);
    }

    try {
      for (const action of actions) store.dispatch(action);

      // For material ui
      const sheets = new ServerStyleSheets();

      // We use a require to support hot reloading
      const App = await import('./containers/app');

      let html = renderToString(
        sheets.collect(
          <Provider store={store}>
            <ThemeProvider theme={theme}>
              <StaticRouter location={url} context={context}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <App.default />
                </MuiPickersUtilsProvider>
              </StaticRouter>
            </ThemeProvider>
          </Provider>
        )
      );

      const styleTags = sheets.getStyleElement();

      // Grab the CSS from the sheets.
      const styleTagsMaterial = sheets.toString();

      // Check the context if there needs to be a redirect
      if (context.url) {
        res.writeHead(301, {
          Location: context.url,
        });
        res.end();
        return;
      }

      initialState = store.getState();
      html = renderToStaticMarkup(
        <HTML
          html={html}
          styles={styleTags}
          stylesMaterial={styleTagsMaterial}
          intialData={initialState}
          agent={muiAgent!}
        />
      );

      res.send(html);
    } catch (err) {
      this.renderError(res, err);
    }
  }

  private renderError(res: express.Response, err: Error) {
    res.status(500);
    res.send(
      renderToStaticMarkup(
        <html>
          <body>
            <div>An Error occurred while rendering the application: {err.message}</div>
            <div>Stack Trace: {err.stack}</div>
          </body>
        </html>
      )
    );
  }
}
