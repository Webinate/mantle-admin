import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';
import { format } from 'date-fns';
import ControllerFactory from '../../../../../src/core/controller-factory';

let users = new UsersPage();
let admin: Agent, joe: Agent;

describe( 'Testing the editing of user details: ', function() {
  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    const users = ControllerFactory.get( 'users' );
    const user = await users.getUser( { username: 'Joe' } );

    const yesterday = new Date();
    yesterday.setDate( yesterday.getDate() - 1 );

    await users.update( user._id, { createdOn: yesterday.getTime() }, false );
  } )

  after( async () => {
  } )

  it( 'should hide detail editing for regular users', async () => {
    await users.load( joe );
    await users.selectUser( joe.email );
    assert.deepEqual( await users.hasSaveDetailsButton(), false );
  } );

  it( 'should show detail editing for admin users', async () => {
    await users.load( admin );
    await users.selectUser( joe.email );
    assert.deepEqual( await users.hasSaveDetailsButton(), true );
  } );

  it( 'should hide user type from regular users', async () => {
    await users.load( joe );
    await users.selectUser( joe.email );
    assert.deepEqual( await users.hasUserTypeField(), false );
  } );

  it( 'should show user type for admin users', async () => {
    await users.load( admin );
    await users.selectUser( joe.email );
    assert.deepEqual( await users.hasUserTypeField(), true );
  } );

  it( 'should have valid fields', async () => {
    await users.load( admin );
    await users.selectUser( joe.email );
    assert( await users.page.$( '.mt-props-username input[disabled]' ) );
    assert( await users.page.$( '.mt-last-active input[disabled]' ) );

    const yesterday = new Date();
    yesterday.setDate( yesterday.getDate() - 1 );

    // Assert the joined date was yesterday
    assert.deepEqual( format( yesterday, 'MMMM Do, YYYY' ), await users.getJoinedDate() );
  } )

  it( 'should allow an admin to edit a user email manually', async () => {
    await users.load( admin );
    await users.selectUser( joe.email );
    await users.userDetailsEmail( 'thisissilly@silly.com' );
    await users.clickSaveDetails();

    await users.selectUser( 'thisissilly@silly.com' );
    const usersArr = await users.getUsersFromList();
    assert.deepEqual( usersArr.length, 1 );
    assert.deepEqual( usersArr[ 0 ].username, joe.username );

    // Revert back
    await users.userDetailsEmail( joe.email );
    await users.clickSaveDetails();
  } );

  it( 'should allow an admin to edit a user type manually', async () => {
    await users.load( admin );
    await users.selectUser( joe.email );

    assert.deepEqual( await users.getUserType(), 'regular' );
    await users.selectUserType( 'admin' );
    await users.clickSaveDetails();

    await users.load( admin );
    await users.selectUser( joe.email );
    assert.deepEqual( await users.getUserType(), 'admin' );
  } );
} );