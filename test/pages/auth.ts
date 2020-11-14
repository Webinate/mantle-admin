import Page from './page';

export default class AuthPage extends Page {
  private $username: string;
  private $email: string;
  private $password: string;
  private $password2: string;

  constructor() {
    super();
    this.$username = '.mt-username';
    this.$email = '.mt-email';
    this.$password = '.mt-password';
    this.$password2 = '.mt-password2';
  }

  async load(toLogin = true, removeCookie = true) {
    await super.load();
    if (removeCookie) this.page.deleteCookie({ name: 'SID' });
    if (toLogin) return super.to('/login');
    else return super.to('/register');
  }

  /**
   * Gets or sets the username value
   * @param {string} val
   * @returns {Promise<string>}
   */
  username(val?: string) {
    return super.textfield(this.$username, val);
  }

  /**
   * Gets or sets the password value
   * @param {string} val
   * @returns {Promise<string>}
   */
  password(val?: string) {
    return super.textfield(this.$password, val);
  }

  /**
   * Gets or sets the email value
   * @param {string} val
   * @returns {Promise<string>}
   */
  email(val?: string) {
    return super.textfield(this.$email, val);
  }

  /**
   * Gets or sets the verify password value
   * @param {string} val
   * @returns {Promise<string>}
   */
  password2(val?: string) {
    return super.textfield(this.$password2, val);
  }

  /**
   * Gets the username error
   * @param {string} val
   * @returns {Promise<string | null>}
   */
  async usernameError() {
    const selector = '#mt-username-error';
    const result = await this.page.$(selector);
    if (!result) return null;

    return this.page.$eval(selector, (e) => e.textContent);
  }

  /**
   * Gets the email error
   * @param {string} val
   * @returns {Promise<string | null>}
   */
  async emailError() {
    const selector = '#mt-email-error';
    const result = await this.page.$(selector);
    if (!result) return null;

    return this.page.$eval(selector, (e) => e.textContent);
  }

  /**
   * Gets the password error
   * @param {string} val
   * @returns {Promise<string | null >}
   */
  async passwordError() {
    const selector = '#mt-password-error';
    const result = await this.page.$(selector);
    if (!result) return null;

    return this.page.$eval(selector, (e) => e.textContent);
  }

  /**
   * Gets the verify password error
   * @param {string } val
   * @returns {Promise<string | null >}
   */
  async password2Error() {
    const selector = '#mt-password2-error';
    const result = await this.page.$(selector);
    if (!result) return null;

    return this.page.$eval(selector, (e) => e.textContent);
  }

  /**
   * Gets the server error response text if it exists
   * @returns {string}
   */
  error() {
    return super.getElmText('.mt-auth-err');
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  doneLoading() {
    return this.page.waitForFunction('document.querySelector(".mt-loading") == null');
  }

  clickLogin() {
    return this.page.click('button.mt-login-btn');
  }
  clickRegister() {
    return this.page.click('button.mt-register-btn');
  }
  clickCreateAccount() {
    return this.page.click('.mt-create-account');
  }
  clickToLogin() {
    return this.page.click('.mt-to-login');
  }
  clickResendActivation() {
    return this.page.click('.mt-resend-activation');
  }
  clickResetPassword() {
    return this.page.click('.mt-retrieve-password');
  }
}
