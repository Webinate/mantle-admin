import Module from "../../../test/pages/modules/module";
import App from "../../../test/pages/modules/app";
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

    return await this.page.$$eval( `.mt-comment`, elm => {
      return Array.from( elm ).map( ( row: HTMLElement ) => {
        return {
          img: ( row.querySelector( '.mt-comment-avatar img' ) as HTMLImageElement ).src,
          author: row.querySelector( '.mt-comment-author' )!.textContent,
          content: row.querySelector( '.mt-comment-text' )!.innerHTML,
          date: row.querySelector( '.mt-comment-date' )!.textContent,
          hasEditBtn: row.querySelector( '.mt-edit-comment-btn' ) ? true : false,
          hasDelBtn: row.querySelector( '.mt-del-comment-btn' ) ? true : false,
          isReply: row.classList.contains( 'mt-is-child' )
        }
      } )
    } ) as Promise<{
      img: string;
      author: string;
      content: string;
      date: string;
      hasEditBtn: boolean;
      hasDelBtn: boolean;
      isReply: boolean;
    }[]>;
  }

  select( index: number ) {
    return this.page.click( `.mt-comment:nth-child(${ index + 1 }) .mt-comment-text` );
  }

  async previewDetails() {
    await this.page.waitFor( `#mt-post-preview` );
    return await this.page.$eval( `#mt-post-preview`, elm => {
      return {
        img: ( elm.querySelector( '.mt-preview-author-avatar img' ) as HTMLImageElement ).src,
        title: elm.querySelector( '#mt-preview-title' ).textContent,
        author: elm.querySelector( '#mt-preview-author' ).textContent,
        date: elm.querySelector( '#mt-preview-date' ).textContent,
        content: elm.querySelector( '#mt-preview-content' ).innerHTML
      }
    } ) as Promise<{
      img: string;
      author: string;
      content: string;
      date: string;
      title: string;
    }>;
  }

  async canDelete( index: number ) {
    const result = await this.page.$( `.mt-comment:nth-child(${ index + 1 }) .mt-del-comment-btn` );
    return result ? true : false;
  }

  async canEdit( index: number ) {
    const result = await this.page.$( `.mt-comment:nth-child(${ index + 1 }) .mt-edit-comment-btn` );
    return result ? true : false;
  }

  async clickDelete( index: number ) {
    await this.page.click( `.mt-comment:nth-child(${ index + 1 }) .mt-del-comment-btn` );
    await this.page.waitFor( '#mt-comment-delete-msg' );
  }

  async editComment( index: number, text: string ) {
    const inputSelector = '#mt-comment-edit-txt';
    await this.page.click( `.mt-comment:nth-child(${ index + 1 }) .mt-edit-comment-btn` );
    await this.page.waitFor( inputSelector );
    await this.page.focus( inputSelector );
    await this.input( inputSelector, text );
    await this.page.click( '#mt-edit-comment-save' );
    await this.emptySelector( '#mt-edit-comment-save' );
    await this.doneLoading();
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

  async addComment( text: string ) {
    const newCommentSelector = '#mt-new-comment-content';

    await this.doneLoading();
    await this.page.waitFor( newCommentSelector );
    await this.page.focus( newCommentSelector );
    await this.input( newCommentSelector, text );
    await this.page.click( '#mt-new-comment-add-btn' );
    await this.doneLoading();
  }

  async replyComment( targetIndex: number, text: string ) {
    const replySelector = "#mt-reply-comment-content";
    await this.page.click( `.mt-comment:nth-child(${ targetIndex + 1 }) .mt-reply-comment-btn` );
    await this.doneLoading();
    await this.page.waitFor( replySelector );
    await this.page.focus( replySelector );
    await this.input( replySelector, text );
    await this.page.click( '#mt-reply-comment-add-btn' );
    await this.doneLoading();
  }
}