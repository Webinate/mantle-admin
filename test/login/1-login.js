const utils = require( '../utils.js' );
const assert = require( 'assert' );

describe( '1. Test login page', function() {

  it( 'it should show the login widget', async () => {
    await utils.page.goto( 'http://localhost:8000' );
    assert( await utils.page.waitForSelector( '.login-form' ) !== null );
  } );

  it( 'it should not allow empty user input', async () => {

    assert( await utils.page.$eval( 'input[name=username]', el => el.value ) == '' )
    assert( await utils.page.$eval( 'input[name=password]', el => el.value ) == '' )

    await utils.page.click( 'button' )

    // TODO: Figure out how to check textfield errors

    // await utils.page.focus( 'input[name=username]' )
    // await utils.page.type( 'some-username', { delay: 10 } )
    // await utils.page.keyboard.down( 'Control' );
    // await utils.page.keyboard.down( 'A' );
    // await utils.page.keyboard.down( 'Delete' );

    // await utils.page.click( 'button' )
  } );
} );