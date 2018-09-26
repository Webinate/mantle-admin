import Module from "modepress/clients/modepress-admin/test/pages/modules/module";
import App from "modepress/clients/modepress-admin/test/pages/modules/app";
import { Page } from 'puppeteer';

/**
 * A module for interacting with comments
 */
export default class CommentsModule extends Module {
  public appModule: App;

  constructor( page: Page ) {
    super( page );
    this.appModule = new App( page );
  }

  doneLoading() {
    return this.emptySelector( '#mt-comments .mt-loading' );
  }

  async getComments() {
    await this.doneLoading();

    return this.page.$$eval( `.mt-comment`, elm => {
      return Array.from( elm ).map( row => {
        return {
          img: ( row.querySelector( '.mt-comment-avatar img' ) as HTMLImageElement ).src,
          author: row.querySelector( '.mt-comment-author' ).textContent,
          content: row.querySelector( '.mt-comment-text' ).innerHTML,
          date: row.querySelector( '.mt-comment-date' ).textContent
        }
      } )
    } ) as Promise<{
      img: string;
      author: string;
      content: string;
      date: string;
    }[]>;
  }

  async deleteComment( index: number ) {
    await this.page.click( `.mt-comment:nth-child(${ index + 1 }) .mt-del-comment-btn` );
    await this.page.waitFor( '#mt-comment-delete-msg' );
  }

  async cancelDelete() {
    await this.page.click( '#mt-del-comment-cancel-btn' );
    await this.emptySelector( '#mt-del-comment-cancel-btn' );
  }

  async confirmDelete() {
    await this.page.click( '#mt-del-comment-confirm-btn' );
    await this.emptySelector( '#mt-del-comment-confirm-btn' );
    await this.doneLoading();
  }
}