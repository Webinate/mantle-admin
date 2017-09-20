const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '3. Login failures', function() {

  before( async () => {
    await auth.load();
  } )

  it( 'it should show the login widget', async () => {
    assert( await auth.$( '.login-form' ) );
  } );


  it( 'it should not allow non-alphanumeric usernames', async () => {

    await auth.username( 'MRIDONTEXISTEVER123!' );
    await auth.password( 'THISISFAKE' );
    await auth.clickLogin();
    assert( await auth.error() === 'Please only use alpha numeric characters for your username' )
  } );
} );