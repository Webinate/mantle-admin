const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const yargs = require( 'yargs' );
let args = yargs.argv;

async function initialize() {
  exports.browser = await puppeteer.launch( { headless: false } );
  exports.page = await exports.browser.newPage();
  exports.modepressConfig = JSON.parse( fs.readFileSync( './modepress.json' ) );
  exports.config = JSON.parse( fs.readFileSync( args.config ) );
  exports.host = `${ exports.modepressConfig.server.host }:${ exports.modepressConfig.server.port }`;
}

exports.initialize = initialize;
