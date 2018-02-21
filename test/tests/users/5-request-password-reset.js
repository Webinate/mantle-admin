const UsersPage = require( '../../pages/users' ).default;
const assert = require( 'assert' );
const utils = require( '../../utils' );

let users = new UsersPage();
let registeredUser;

describe( '5. Request Password Reset', function() {
  before( async () => {
    const agent = await utils.refreshAdminToken();
    registeredUser = await utils.createAgent( 'RegisteredUser', 'registered333@test.com', 'password', true );
    await users.load( agent );
    assert( await users.$( '.mt-user-list' ) );
  } )

  it( 'it should show a message that an email was sent', async () => {
    await users.selectUser( 'registered333@test.com' );
    await users.clickDrawer( 'Account Settings' );
    await users.waitFor( '.mt-reset-password' );
    await users.click( '.mt-reset-password' );
    assert.equal( await users.getSnackMessage(), 'Instructions have been sent to your email on how to change your password' );
  } );
} );