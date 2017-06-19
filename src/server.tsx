import * as React from 'react';
import {Express} from 'express';
import {Db} from 'mongodb';
import {App} from './components/app';
const ReactDOMServer = require('react-dom/server');

/**
 * The default entry point for the admin server
 */
export default class Server {
  constructor() {

  }

  async initialize(app: Express, db: Db) {
    app.use("*", function(req, res) {
      const html = ReactDOMServer.renderToString(<App title="Modepress Server Rendering" />);
      res.send(200, html );
    })
  }
}