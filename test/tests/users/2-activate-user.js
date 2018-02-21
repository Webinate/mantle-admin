const UsersPage = require( '../../pages/users' ).default;
const assert = require( 'assert' );
const utils = require( '../../utils' );

let users = new UsersPage();
let registeredUser;

describe( '2. Activate user', function() {
  before( async () => {
    const agent = await utils.refreshAdminToken();
    registeredUser = await utils.createAgent( 'RegisteredUser', 'registered333@test.com', 'password', true );
    await users.load( agent );
    assert( await users.$( '.mt-user-list' ) );
  } )

  it( 'it should activate a user when an admin', async () => {
    await users.selectUser( 'registered333@test.com' );
    await users.clickDrawer( 'Account Settings' );

    await users.waitFor( '.mt-activate-account' );
    await users.page.hover( '.mt-activate-account' );
    await users.click( '.mt-activate-account' );

    assert.equal( await users.getSnackMessage(), 'User successfully activated' );

    // User should now be activated
    await users.selectUser( 'registered333@test.com' );
    await users.clickDrawer( 'Account Settings' );
    assert( !( await users.$( '.mt-activate-account' ) ) );
  } );
} );