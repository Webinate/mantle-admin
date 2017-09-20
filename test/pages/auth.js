const Page = require( './page' );

class AuthPage extends Page {
  constructor() {
    super();
    this.$username = '.mt-username';
    this.$password = '.mt-password';
    this.$password2 = '.mt-password2';
  }

  async load( toLogin = true ) {
    await super.load();
    if ( toLogin )
      return super.to( 'http://localhost:8000/login' );
    else
      return super.to( 'http://localhost:8000/register' );
  }

  /**
   * Gets or sets the username value
   * @param {string} val
   * @returns {Promise<string>}
   */
  username( val ) {
    return super.textfield( this.$username, val )
  }

  /**
   * Gets or sets the password value
   * @param {string} val
   * @returns {Promise<string>}
   */
  password( val ) {
    return super.textfield( this.$password, val )
  }

  /**
   * Gets or sets the verify password value
   * @param {string} val
   * @returns {Promise<string>}
   */
  password2( val ) {
    return super.textfield( this.$password2, val )
  }

  /**
   * Gets the username error
   * @param {string} val
   * @returns {Promise<string | null>}
   */
  usernameError() {
    return this.textfieldError( this.$username );
  }

  /**
   * Gets the password error
   * @param {string } val
   * @returns {Promise<string | null >}
   */
  passwordError() {
    return this.textfieldError( this.$password );
  }

  /**
   * Gets the verify password error
   * @param {string } val
   * @returns {Promise<string | null >}
   */
  password2Error() {
    return this.textfieldError( this.$password2 );
  }

  /**
   * Gets the server error response text if it exists
   * @returns {string}
   */
  error() { return super.getElmText( '.mt-auth-err' ); }

  clickLogin() { return this.page.click( '.mt-login-btn button' ); }
  clickRegister() { return this.page.click( '.mt-register-btn button' ); }
  clickCreateAccount() { return this.page.click( '.mt-create-account' ); }
  clickToLogin() { return this.page.click( '.mt-to-login' ); }
  clickResendActivation() { return this.page.click( '.mt-resend-activation' ); }
  clickResetPassword() { return this.page.click( '.mt-retrieve-password' ); }
}

module.exports = AuthPage;