const utils = require( '../utils.js' );
const assert = require( 'assert' );
let page;

describe( '1. Test login page', function() {

  before( () => {
    page = utils.page;
  } )

  it( 'it should show the login widget', async () => {
    await page.goto( 'http://localhost:8000' );
    assert( await page.$( '.login-form' ) );
  } );

  it( 'it should not allow empty user input', async () => {

    assert( await page.$eval( '.mt-username input', el => el.value ) == '' );
    assert( await page.$eval( '.mt-password input', el => el.value ) == '' );

    await page.click( 'button' );

    assert( await page.$eval( '.mt-username > div:nth-child(4)', el => el.textContent ) == 'Please specify a username' );
    assert( await page.$eval( '.mt-password > div:nth-child(4)', el => el.textContent ) == 'Please specify a password' );

    // Select user and type something
    await utils.page.focus( '.mt-username input' );
    await utils.page.type( 'some-username', { delay: 10 } );

    // Error must be gone
    assert( await page.$( '.mt-username > div:nth-child(4)' ) == null );

    // Select password and type something
    await utils.page.focus( '.mt-password input' );
    await utils.page.type( 'somepassword', { delay: 10 } );

    // Error must be gone
    assert( await page.$( '.mt-password > div:nth-child(4)' ) == null );
  } );

  it( 'it should switch from login to register and back', async () => {
    let location;

    location = await page.evaluate( async () => window.location );
    assert( await page.$( '.login-form' ) );
    assert( location.pathname.endsWith( '/login' ) )

    await page.click( '.mt-create-account' );
    page.waitFor( '.register-form' )
    location = await page.evaluate( async () => window.location );
    assert( location.pathname.endsWith( '/register' ) );

    assert( await page.$( '.register-form' ) );

    await page.click( '.mt-to-login' );
    page.waitFor( '.login-form' );
    location = await page.evaluate( async () => window.location );
    assert( location.pathname.endsWith( '/login' ) )

    assert( await page.$( '.login-form' ) );
  } )
} );