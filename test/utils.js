const puppeteer = require( 'puppeteer' );

async function initialize() {
  exports.browser = await puppeteer.launch( { headless: false } );
  exports.page = await exports.browser.newPage();
}

exports.initialize = initialize;
