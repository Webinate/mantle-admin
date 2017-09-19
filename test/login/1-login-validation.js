const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '1. Test login validation', function() {

  before( async () => {
    await auth.load();
  } )


  it( 'it should show the login widget', async () => {
    assert( await auth.$( '.login-form' ) );
  } );


  it( 'it should not allow empty user input', async () => {

    assert( await auth.username() == '' );
    assert( await auth.password() == '' );
    assert( await auth.usernameError() == null );
    assert( await auth.passwordError() == null );

    await auth.clickLogin();

    assert( await auth.usernameError() == 'Please specify a username' );
    assert( await auth.passwordError() == 'Please specify a password' );

    // Select user and type something and the error must vanish
    await auth.username( 'some-username' );
    assert( await auth.usernameError() == null );

    // Select password and type something and the error must vanish
    await auth.password( 'somepassword' );
    assert( await auth.passwordError() == null );

    //If we clear the fields, the errors should return
    await auth.password( '' );
    await auth.username( '' );
    assert( await auth.passwordError() == 'Please specify a password' );
    assert( await auth.usernameError() == 'Please specify a username' );
  } );


  it( 'it should switch from login to register and back', async () => {

    // Make sure we're on login
    assert( await auth.$( '.login-form' ) );
    assert( ( await auth.pathname() ).endsWith( '/login' ) )

    // Go to register
    await auth.clickCreateAccount();
    auth.waitFor( '.register-form' );
    assert( ( await auth.pathname() ).endsWith( '/register' ) );

    // Go back to login
    await auth.clickToLogin();
    auth.waitFor( '.login-form' );
    assert( ( await auth.pathname() ).endsWith( '/login' ) );
  } )


  it( 'it should not allow empty user input for sending activation or password', async () => {
    assert( await auth.username() == '' );
    assert( await auth.usernameError() == null );

    await auth.clickResendActivation();
    assert( await auth.usernameError() == 'Please specify a username' );
  } );
} );