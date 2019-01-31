import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';

let users = new UsersPage();
let admin: Agent, joe: Agent;

describe( 'Testing the creation of new users: ', function() {
  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
  } )

  it( 'should hide the add user button for regular users', async () => {
    await users.load( joe );
    assert.deepEqual( await users.hasAddUserButton(), false );
  } );

  it( 'should show the add user button for admin users', async () => {
    await users.load( admin );
    assert.deepEqual( await users.hasAddUserButton(), true );
  } );

  it( 'should go to and hide the new user form using navigation buttons', async () => {
    await users.load( admin );
    await users.clickAddNewUser();
    assert.notDeepEqual( await users.page.$( '#mt-new-user-form' ), null );
    await users.clickCancelNewUser();
    assert.deepEqual( await users.page.$( '#mt-new-user-form' ), null );
  } );

  it( 'validates the inputs by disabling the add button', async () => {
    await users.load( admin );
    await users.clickAddNewUser();
    assert.deepEqual( await users.newUserUsername(), '' );
    assert.deepEqual( await users.newUserPassord(), '' );
    assert.deepEqual( await users.newUserEmail(), '' );
    assert.deepEqual( await users.newUserEmail(), '' );
    assert.deepEqual( await users.isNewUserAddBtnDisabled(), true );

    await users.newUserUsername( 'user' );
    assert.deepEqual( await users.isNewUserAddBtnDisabled(), true );

    await users.newUserPassord( 'password' );
    assert.deepEqual( await users.isNewUserAddBtnDisabled(), true );

    await users.newUserEmail( 'email' );
    assert.deepEqual( await users.isNewUserAddBtnDisabled(), false );
  } );
} );