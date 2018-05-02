var fs = require( 'fs' );
var yargs = require( 'yargs' );
var args = yargs.argv;

require( "ts-node" ).register( {
  compilerOptions: {
    module: "commonjs",
    sourceMap: true,
    target: "es2017",
    isolatedModules: true
  },
} );

if ( !args.config || !fs.existsSync( args.config ) ) {
  console.log( "Please specify a modepress --config file to use in the command line" );
  process.exit();
}

const startup = require( '../../../src/core/initialization/startup' );
const utils = require( './utils' ).default;

describe( 'Initialize Server', function() {

  // Initialize the server
  before( async function() {
    this.timeout( 20000 );
    await startup.initialize();
    await utils.initialize();
  } )

  it( 'should be initialized', function( done ) {
    return done();
  } );
} );

// require( './tests/login/1-login-validation' );
// require( './tests/login/2-register-validation' );
// require( './tests/login/3-login-failures' );
// require( './tests/login/4-reset-failures' );
// require( './tests/login/5-register-failures' );
// require( './tests/login/6-successful-login-logout' );
// require( './tests/users/1-find-user' );
// require( './tests/users/2-activate-user' );
// require( './tests/users/3-delete-user' );
// require( './tests/users/4-resend-activation' );
// require( './tests/users/5-request-password-reset' );
require( './tests/posts/1-view-post' );
require( './tests/posts/2-create' );