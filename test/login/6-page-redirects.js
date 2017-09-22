const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '6. Page Redirects', function() {

  before( async () => {
    await auth.load();
  } )

  it( 'it should not allow you to go to /dashboard when not logged in', async () => {
    await auth.to( '/dashboard' );
    await auth.waitFor( '.login-form' );
    assert.equal( await auth.pathname(), '/login' );
  } );

  it( 'it should allow you to go to /register when not logged in', async () => {
    await auth.to( '/register' );
    await auth.waitFor( '.register-form' );
  } );
} );