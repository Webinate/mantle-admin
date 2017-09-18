var fs = require( 'fs' );
var yargs = require( 'yargs' );
var args = yargs.argv;

if ( !args.config || !fs.existsSync( args.config ) ) {
  console.log( "Please specify a modepress --config file to use in the command line" );
  process.exit();
}

const startup = require( '../../../dist/core/initialization/startup.js' );
const utils = require( './utils.js' );

describe( 'Initialize Server', function() {

  // Initialize the server
  before( async function() {
    await startup.initialize();
    await utils.initialize();
  } )

  it( 'should be initialized', function( done ) {
    return done();
  } );
} );

require( './login/1-login' );