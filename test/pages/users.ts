import Page from './page';
import Agent from '../utils/agent';
import AppModule from './modules/app';
import MediaModule from './modules/media-nav';
import * as assert from 'assert';

export default class UsersPage extends Page {
  public appModule: AppModule;
  public mediaModule: MediaModule;
  private $filter: string;
  private $filterSearch: string;

  constructor() {
    super();

    this.$filter = '.users-filter';
    this.$filterSearch = '#mt-users-search-button';
  }

  async load( agent: Agent ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( '/dashboard/users' );

    this.appModule = new AppModule( this.page );
    this.mediaModule = new MediaModule( this.page );

    assert( await this.$( '.mt-user-list' ) );
  }

  async selectUser( email: string ) {
    await this.filter( email );
    await this.clickFilterBtn();
    await this.doneLoading();
    const user = await this.getUserByIndex( 0 );
    await user.click();
    await this.page.waitFor( '.mt-user-properties' );
  }

  /**
   * Gets or sets the user filter value
   * @param {string} val
   * @returns {Promise<string>}
   */
  filter( val?: string ) {
    return super.textfield( this.$filter, val )
  }

  async selectProfilePic() {
    await this.page.click( '#mt-upload-profile' );
    await this.page.waitFor( '.mt-volume-table' );
  }

  async hasAddUserButton() {
    return await this.page.$( '#mt-add-user' ) ? true : false;
  }

  async hasSaveDetailsButton() {
    return await this.page.$( '#mt-save-user-details' ) ? true : false;
  }

  async clickSaveDetails() {
    await this.page.click( '#mt-save-user-details' );
    await this.doneLoading();
  }

  getJoinedDate() {
    return this.input( '.mt-joined-on input' );
  }

  userDetailsEmail( val?: string ) {
    return this.input( '#mt-user-email', val );
  }

  async clickCancelNewUser() {
    await this.page.click( '#mt-cancel-new-user' );
    await this.page.waitFor( '#mt-add-user' );
  }

  async clickAddNewUser() {
    await this.page.click( '#mt-add-user' );
    await this.page.waitFor( '#mt-cancel-new-user' );
  }

  newUserUsername( val?: string ) {
    return this.input( '#mt-new-username', val );
  }

  newUserPassord( val?: string ) {
    return this.input( '#mt-new-password', val );
  }

  newUserEmail( val?: string ) {
    return this.input( '#mt-new-email', val );
  }

  async isNewUserAddBtnDisabled() {
    return await this.page.$( '#mt-confirm-add-user[disabled]' ) ? true : false;
  }

  clickNewUserAddBtn() {
    return this.page.click( '#mt-confirm-add-user' );
  }

  async getUserProfileImg(): Promise<string> {
    return this.page.$eval( '.mt-user-properties img', ( elm: HTMLImageElement ) => elm.src );
  }

  async clickDrawer( headerName: string ) {
    const headers = await this.page.$$( '.mt-user-properties .mt-panel-header' );
    for ( const header of headers ) {
      const text = await header.executionContext().evaluate( elm => elm.textContent, header );
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
  async getUserByEmail( email: string ) {
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

  async getUserByIndex( index: number ) {
    const users = await this.page.$$( `.mt-user-list > div` );
    return users[ index ];
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
  getUserFromList( index: number ) {
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
          email: child.querySelector( '.mt-user-email' ).textContent,
          profileImg: child.querySelector( 'img' ).src
        }
      } )
    } ) as Promise<{ username: string; email: string; profileImg: string; }[]>;
  }

  clickFilterBtn() { return this.page.click( this.$filterSearch ); }
}