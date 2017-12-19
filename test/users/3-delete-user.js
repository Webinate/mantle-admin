const UsersPage = require( '../pages/users' );
const assert = require( 'assert' );
const utils = require( '../utils' );

let users = new UsersPage();
let tempUser;

describe( '3. Delete user', function() {
  before( async () => {
    const agent = await utils.refreshAdminToken();
    tempUser = await utils.createAgent( 'TempUser1122', 'tempuser1122@test.com', 'password', true );
    await users.load( agent );
    assert( await users.$( '.mt-user-list' ) );
  } )

  it( 'Delete a user when an admin clicks the delete button', async () => {
    await users.selectUser( 'tempuser1122@test.com' );
    await users.clickDrawer( 'Remove Account' );
    await users.page.click( '.mt-remove-acc-btn' );

    // Ensure modal is open
    await users.waitFor( '.mt-users-modal' );

    // Ensure we can cancel the operation
    await users.closeModal( true );
    assert.equal( await users.isModelClosed(), true );

    // Re-open the modal
    await users.page.click( '.mt-remove-acc-btn' );
    await users.waitFor( '.mt-users-modal' );

    assert.equal( await users.getModalMessage(), `Are you sure you want to remove the user 'TempUser1122', this action is irreversible?` );

    // Accept the warning
    await users.closeModal( false );
    assert.equal( await users.isModelClosed(), true );

    assert.equal( await users.getSnackMessage(), `User 'TempUser1122' successfully removed` )
  } );
} );