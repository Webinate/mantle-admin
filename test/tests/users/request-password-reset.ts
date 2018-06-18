import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';

let users = new UsersPage();
let registeredUser: Agent;

describe( 'Request Password Reset', function() {
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
    assert.equal( await users.appModule.getSnackMessage(), 'Instructions have been sent to your email on how to change your password' );
  } );
} );