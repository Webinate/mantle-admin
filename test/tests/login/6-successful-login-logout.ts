import AuthPage from '../../pages/auth';
import * as assert from 'assert';
import { } from 'mocha';
let auth = new AuthPage();

describe( '6. Successful login/logout', function() {

  before( async () => {
    await auth.load();
  } )

  it( 'it should login with valid username & password', async () => {
    await auth.username( auth.config.adminUser.username );
    await auth.password( auth.config.adminUser.password );
    await auth.clickLogin();
    await auth.doneLoading();
    await auth.waitFor( '.mt-dashboard' );
    assert.equal( await auth.pathname(), '/dashboard' );
  } );

  it( 'it should not allow you to go to /login when logged in', async () => {
    await auth.to( '/login' );
    await auth.waitFor( '.mt-dashboard' );
    assert.equal( await auth.pathname(), '/dashboard' );
  } );

  it( 'it should not allow you to go to /register when logged in', async () => {
    await auth.to( '/register' );
    await auth.waitFor( '.mt-dashboard' );
    assert.equal( await auth.pathname(), '/dashboard' );
  } );

  it( 'it should logout', async () => {
    await auth.page.click( '.mt-user-menu' );
    await auth.page.hover( '.mt-logout' );
    await auth.page.click( '.mt-logout' );
    await auth.waitFor( '.login-form' );
    assert.equal( await auth.pathname(), '/login' );
  } );

} );