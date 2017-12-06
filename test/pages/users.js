const Page = require( './page' );

class UsersPage extends Page {
  constructor() {
    super();
    this.$username = '.mt-username';
  }

  async load( agent ) {
    await super.load();
    if ( agent )
      await this.setAgent( agent );
    return super.to( '/dashboard/users' );
  }

  /**
   * Gets or sets the username value
   * @param {string} val
   * @returns {Promise<string>}
   */
  username( val ) {
    return super.textfield( this.$username, val )
  }
}

module.exports = UsersPage;