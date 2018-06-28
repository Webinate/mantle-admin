import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';

let users = new UsersPage();
let registeredUser: Agent;

describe( 'Activate user: ', function() {
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

    assert.equal( await users.appModule.getSnackMessage(), 'User successfully activated' );

    // User should now be activated
    await users.selectUser( 'registered333@test.com' );
    await users.clickDrawer( 'Account Settings' );
    assert( !( await users.$( '.mt-activate-account' ) ) );
  } );
} );