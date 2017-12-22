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

  async selectUser( email ) {
    await this.filter( email );
    await this.clickFilterBtn();
    await this.doneLoading();
    const user = await this.getUserByEmail( email );
    await user.click();
    await this.page.waitFor( '.mt-user-properties' );
  }

  /**
   * Gets or sets the user filter value
   * @param {string} val
   * @returns {Promise<string>}
   */
  filter( val ) {
    return super.textfield( this.$filter, val )
  }

  async clickDrawer( headerName ) {
    const headers = await this.page.$$( '.mt-user-properties .mt-drawer-header' );
    for ( const header of headers ) {
      const text = await header.executionContext().evaluate( elm => elm.querySelector( 'h3' ).textContent, header );
      if ( text === headerName ) {
        await this.sleep( 150 );
        await header.executionContext().evaluate( elm => elm.scrollIntoView(), header );
        await header.click();
        return header;
      }
    }

    return null;
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  doneLoading() {
    return this.page.waitForFunction( 'document.querySelector(".mt-loading") == null' );
  }

  /**
   * Gets a user element by email
   * @param {string} email The email of the user to select
   */
  async getUserByEmail( email ) {
    const users = await this.page.$$( `.mt-user-list > div` );
    for ( const user of users ) {
      const text = await user.executionContext().evaluate(
        ( elm ) => elm.querySelector( '.mt-user-email' ).textContent, user
      );
      if ( text === email )
        return user;
    }

    return null;
  }

  async getSnackMessage() {
    await this.page.waitFor( '.mt-response-message[open]' );
    return this.$eval( '.mt-response-message > div > div > span', elm => elm.textContent );
  }

  closeSnackMessage() {
    return this.click( '.mt-response-message button' );
  }

  getModalMessage() {
    return this.$eval( '.mt-modal-message', elm => elm.textContent );
  }

  async isModelClosed() {
    const result = await this.$( '.mt-users-modal' );
    return result ? false : true;
  }

  async closeModal( cancel = true ) {
    await this.waitFor( '.mt-users-modal .mt-cancel' );

    if ( cancel )
      await this.click( '.mt-users-modal .mt-cancel' );
    else
      await this.click( '.mt-users-modal .mt-confirm' );

    await this.page.waitForFunction( '!window.document.querySelector(".mt-users-modal")' );
  }

  /**
   * Gets a user object { username: string; email: string; } from the user list by index
   * @param {number} index The index of the user to examine
   */
  getUserFromList( index ) {
    return this.page.$eval( `.mt-user-list > div:nth-child(${ index + 1 })`, elm => {
      return {
        username: elm.querySelector( '.mt-user-name' ).textContent,
        email: elm.querySelector( '.mt-user-email' ).textContent
      }
    } );
  }

  /**
   * Gets an array of user objects of visible the visible users { username: string; email: string; }
   */
  getUsersFromList() {
    return this.page.$eval( `.mt-user-list`, elm => {
      return Array.from( elm.children ).map( child => {
        return {
          username: child.querySelector( '.mt-user-name' ).textContent,
          email: child.querySelector( '.mt-user-email' ).textContent
        }
      } )
    } );
  }

  clickFilterBtn() { return this.page.click( this.$filterSearch ); }
}

module.exports = UsersPage;