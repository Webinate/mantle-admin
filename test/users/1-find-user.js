const UsersPage = require( '../pages/users' );
const assert = require( 'assert' );
const utils = require( '../utils' );

let users = new UsersPage();

describe( '1. Find Users', function() {

  before( async () => {
    const agent = await utils.refreshAdminToken();
    await users.load( agent );
  } )


  it( 'it should show the users page', async () => {
    assert( await users.$( '.mt-user-list' ) );
  } );
} );