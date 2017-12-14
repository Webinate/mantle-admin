const UsersPage = require( '../pages/users' );
const assert = require( 'assert' );
const utils = require( '../utils' );

let users = new UsersPage();
let registeredUser;

describe( '2. Activate user', function() {
  before( async () => {
    const agent = await utils.refreshAdminToken();
    registeredUser = await utils.createAgent( 'RegisteredUser', 'registered333@test.com', 'password', true );
    await users.load( agent );
    assert( await users.$( '.mt-user-list' ) );
  } )

  it( 'it should show user details panel when we click on registered user', async () => {
    await users.selectUser( 'registered333@test.com' );
    await users.clickDrawer( 'Account Settings' );
    await users.waitFor( '.mt-activate-account' );
    await users.page.click( '.mt-activate-account' );
    users.waitFor( '.mt-response-message' )
  } );
} );