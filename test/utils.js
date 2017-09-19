const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const yargs = require( 'yargs' );
let args = yargs.argv;

async function initialize() {
  exports.browser = await puppeteer.launch( { headless: false } );
  exports.page = await exports.browser.newPage();
  exports.config = JSON.parse( fs.readFileSync( args.config ) );
}

exports.initialize = initialize;
