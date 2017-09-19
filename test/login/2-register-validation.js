const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '2. Test register validation', function() {

  before( async () => {
    await auth.load( false );
  } )


  it( 'it should show the register form', async () => {
    assert( await auth.$( '.register-form' ) );
  } );


  it( 'it should not allow empty registration input', async () => {

    assert( await auth.username() == '' );
    assert( await auth.password() == '' );
    assert( await auth.password2() == '' );
    assert( await auth.usernameError() == null );
    assert( await auth.passwordError() == null );
    assert( await auth.password2Error() == null );

    await auth.clickRegister();

    assert( await auth.usernameError() == 'Please specify a username' );
    assert( await auth.passwordError() == 'Please specify a password' );
    assert( await auth.password2Error() == null );

    // Select user and type something and the error must vanish
    await auth.username( 'some-username' );
    assert( await auth.usernameError() == null );

    // Select password and type something and the error must vanish
    await auth.password( 'somepassword' );
    assert( await auth.passwordError() == null );
    assert( await auth.password2Error() == 'Passwords do not match' );

    await auth.password2( 'somepassword' );
    assert( await auth.password2Error() == null );

    //If we clear the fields, the errors should return
    await auth.password( '' );
    await auth.password2( '' );
    await auth.username( '' );
    assert( await auth.passwordError() == 'Please specify a password' );
    assert( await auth.usernameError() == 'Please specify a username' );
    assert( await auth.password2Error() == null );
  } );
} );