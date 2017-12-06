const UsersPage = require( '../pages/users' );
const assert = require( 'assert' );
const utils = require( '../utils' );

let users = new UsersPage();
let joe, joey, mary;

describe( '1. Finds users by username and email', function() {

  before( async () => {
    const agent = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    joey = await utils.createAgent( 'Joey', 'joey444@test.com', 'password' );
    mary = await utils.createAgent( 'Mary', 'mary333@test.com', 'password' );

    await users.load( agent );
  } )


  it( 'it should show the users page', async () => {
    assert( await users.$( '.mt-user-list' ) );
  } );

  it( 'it should get at least 2 users for `joe`', async () => {
    await users.filter( 'joe' );
    await users.clickFilterBtn();
    const joeElm = await users.getUserFromList( 0 );

    await users.doneLoading();
    assert.equal( joeElm.username, joe.username );
    assert.equal( joeElm.email, joe.email );
  } );
} );