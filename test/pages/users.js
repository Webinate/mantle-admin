const Page = require( './page' );

class UsersPage extends Page {
  constructor() {
    super();
    this.$filter = '.users-filter';
    this.$filterSearch = 'button[name=users-search-button]';
  }

  async load( agent ) {
    await super.load();
    if ( agent )
      await this.setAgent( agent );
    return super.to( '/dashboard/users' );
  }

  /**
   * Gets or sets the user filter value
   * @param {string} val
   * @returns {Promise<string>}
   */
  filter( val ) {
    return super.textfield( this.$filter, val )
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  doneLoading() { return this.page.waitForFunction( 'document.querySelector(".mt-loading") == null' ); }

  getUserFromList( index ) {
    return this.page.$eval( `.mt-user-list > div:nth-child(${ index + 1 })`, elm => {
      return {
        username: elm.querySelector( '.mt-user-name' ).textContent,
        email: elm.querySelector( '.mt-user-email' ).textContent
      }
    } );
  }

  clickFilterBtn() { return this.page.click( this.$filterSearch ); }
}

module.exports = UsersPage;