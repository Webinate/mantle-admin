import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';

let users = new UsersPage();
let admin: Agent, joe: Agent;
let newUsername: string, newUserEmail: string;

describe( 'Testing the creation of new users: ', function() {
  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
  } )

  after( async () => {
    if ( newUsername )
      await ControllerFactory.get( 'users' ).remove( newUsername );
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

  it( 'shows an error notification for users that already exist', async () => {
    await users.load( admin );
    await users.clickAddNewUser();
    await users.newUserUsername( 'Joe' );
    await users.newUserPassord( 'password' );
    await users.newUserEmail( 'joe222@test.com' );
    await users.clickNewUserAddBtn();
    assert.deepEqual( await users.appModule.getSnackMessage(), 'A user with that name or email already exists' );
  } );

  it( 'shows an error notification for users with an existing email', async () => {
    await users.load( admin );
    await users.clickAddNewUser();
    await users.newUserUsername( randomId() );
    await users.newUserPassord( 'password' );
    await users.newUserEmail( 'joe222@test.com' );
    await users.clickNewUserAddBtn();
    assert.deepEqual( await users.appModule.getSnackMessage(), 'A user with that name or email already exists' );
  } );

  it( 'does create a valid new user', async () => {
    await users.load( admin );
    await users.clickAddNewUser();
    newUsername = randomId();
    newUserEmail = randomId() + '@test.com';

    await users.newUserUsername( newUsername );
    await users.newUserPassord( 'password' );
    await users.newUserEmail( newUserEmail );
    await users.clickNewUserAddBtn();
    await users.doneLoading();

    // Check the user is here
    await users.hasAddUserButton();
    await users.selectUser( newUserEmail );
  } );
} );