import AuthPage from '../../pages/auth';
import * as assert from 'assert';
import { } from 'mocha';
let auth = new AuthPage();

describe( 'Reset failures: ', function() {

  before( async () => {
    await auth.load();
  } )

  it( 'it should show the login widget', async () => {
    assert( await auth.$( '.login-form' ) );
  } );

  it( 'it should not allow non-alphanumeric characters on a reset a password', async () => {
    await auth.username( 'MRIDONTEXISTEVER123!' );
    await auth.clickResetPassword();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'Please only use alpha numeric characters for your username' );
  } );

  it( 'it should not allow non-alphanumeric characters on resend an activation', async () => {
    await auth.username( 'MRIDONTEXISTEVER123!' );
    await auth.clickResendActivation();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'Please only use alpha numeric characters for your username' );
  } );

  it( 'it should not allow non user to reset a password', async () => {
    await auth.username( 'MRIDONTEXISTEVER123' );
    await auth.clickResetPassword();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'The username or password is incorrect.' );
  } );

  it( 'it should not allow non user to resend an activation', async () => {
    await auth.username( 'MRIDONTEXISTEVER123' );
    await auth.clickResendActivation();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'The username or password is incorrect.' );
  } );
} );