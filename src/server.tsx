import * as React from 'react';
import { StaticRouter } from 'react-router';
import {Express} from 'express';
import {Db} from 'mongodb';
import {App} from './components/app';
import {Routes} from './components/routes';
const ReactDOMServer = require('react-dom/server');

/**
 * The default entry point for the admin server
 */
export default class Server {
  constructor() {

  }

  async initialize(app: Express, db: Db) {
    const context = {}

    app.use("*", function(req, res) {
      const html = ReactDOMServer.renderToString(
        <App title="Modepress Server Rendering">
          <StaticRouter
            location={req.url}
            context={context}
          >
            <Routes />
          </StaticRouter>
        </App>);
      res.send(200, html );
    })
  }
}