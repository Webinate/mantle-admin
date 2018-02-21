const PostsPage = require( '../../pages/posts' ).default;
const assert = require( 'assert' );
const utils = require( '../../utils' );

let posts = new PostsPage();
let admin;

describe( '1. Show new post as first item in posts page', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    await posts.load( admin );
    assert( await posts.$( '.mt-posts' ) );
  } )

} );