import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';

let users = new UsersPage();
let joe: Agent, joey: Agent, mary: Agent, unActivatedUser: Agent;

describe( 'Finds users by username and email: ', function() {

  before( async () => {
    const agent = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    joey = await utils.createAgent( 'Joey', 'joey444@test.com', 'password' );
    mary = await utils.createAgent( 'Mary', 'mary333@test.com', 'password' );
    unActivatedUser = await utils.createAgent( 'Unactivated', 'unactivated333@test.com', 'password', true );

    await users.load( agent );
    assert( await users.$( '.mt-user-list' ) );
  } )

  it( 'it should get at least 2 users for `joe`', async () => {
    await users.filter( 'joe' );
    await users.clickFilterBtn();
    await users.doneLoading();
    const usersArr = await users.getUsersFromList();
    assert( usersArr.length >= 2 );
  } );

  it( 'it should display joes details in the user list', async () => {
    await users.filter( 'joe222@test.com' );
    await users.clickFilterBtn();
    await users.doneLoading();
    const joeElm = await users.getUserFromList( 0 );
    assert.equal( joeElm.username, joe.username );
    assert.equal( joeElm.email, joe.email );
  } );

  it( 'it should show user details panel when we click on Joe as an admin', async () => {
    await users.selectUser( 'joe222@test.com' );
    users.waitFor( '.mt-user-properties' );

    assert.equal( await users.textfield( '.mt-user-properties .mt-props-username' ), 'Joe' );
    assert.equal( await users.textfield( '.mt-user-properties .mt-props-email' ), 'joe222@test.com' );

    // Open the panels & check the buttons are there
    await users.clickDrawer( 'Account Settings' );
    await users.waitFor( '.mt-reset-password' );

    await users.clickDrawer( 'Remove Account' );
    await users.waitFor( '.mt-remove-acc-btn' );
  } );

  it( 'it should show limited details when we click on a user thats not the owner', async () => {
    await users.load( joe );
    await users.selectUser( 'mary333@test.com' );

    // Joe should not see mary's personal details
    assert( !( await users.$( '.mt-props-email' ) ) );
    assert( !( await users.$( '.mt-last-active' ) ) );

    // Joe should not see mary's buttons
    assert( !( await users.$( '.mt-account-settings' ) ) );
    assert( !( await users.$( '.mt-remove-account' ) ) );

    await users.selectUser( 'joe222@test.com' );

    // Joe should see his own buttons
    assert( ( await users.$( '.mt-account-settings' ) ) );
    assert( ( await users.$( '.mt-remove-account' ) ) );
  } );

  it( 'it should show activation buttons for non-activated users to the admin', async () => {
    const admin = await utils.refreshAdminToken();
    await users.load( admin );
    await users.selectUser( 'unactivated333@test.com' );

    // We should see activation buttons
    await users.clickDrawer( 'Account Settings' );
    assert( ( await users.$( '.mt-resend-activation' ) ) );
    assert( ( await users.$( '.mt-activate-account' ) ) );
  } );
} );