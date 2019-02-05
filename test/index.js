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
  console.log( "Please specify a mantle --config file to use in the command line" );
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

require( './tests/login/login-validation' );
require( './tests/login/register-validation' );
require( './tests/login/login-failures' );
require( './tests/login/reset-failures' );
require( './tests/login/register-failures' );
require( './tests/login/successful-login-logout' );

require( './tests/users/find-user' );
require( './tests/users/activate-user' );
require( './tests/users/delete-user' );
require( './tests/users/resend-activation' );
require( './tests/users/request-password-reset' );
require( './tests/users/update-profile-pic' );
require( './tests/users/edit-details' );
require( './tests/users/add-new-user' );

require( './tests/posts/view-and-filter-post' );
require( './tests/posts/create' );
require( './tests/posts/edit-post' );
require( './tests/posts/categories' );
require( './tests/posts/delete-posts' );
require( './tests/posts/post-elements-creation' );
require( './tests/posts/post-elements-add-link' );
require( './tests/posts/post-elements-set-styles' );
require( './tests/posts/post-elements-delete-elm' );
require( './tests/posts/post-elements-delete-elm' );
require( './tests/posts/post-elements-images' );
require( './tests/posts/change-template' );
require( './tests/posts/post-elements-copy-paste' );
require( './tests/posts/post-elements-add-html' );

require( './tests/posts/post-preview' );
require( './tests/posts/preview-post-comments' );
require( './tests/posts/preview-post-permissions' );

require( './tests/media/create-volumes' );
require( './tests/media/filter-and-sort-volumes' );
require( './tests/media/volume-table-fetching' );
require( './tests/media/delete-volumes' );
require( './tests/media/rename-volumes' );
require( './tests/media/open-and-upload-file' );
require( './tests/media/filter-and-sort-files' );
require( './tests/media/delete-files' );
require( './tests/media/rename-files' );
require( './tests/media/get-files-permissions' );

require( './tests/comments/view-and-filter-comments' );
require( './tests/comments/view-comment-posts' );
require( './tests/comments/comment-user-permissions' );
require( './tests/comments/comment-deletion' );
require( './tests/home/latest-post' );
require( './tests/home/recent-posts' );