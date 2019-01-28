import Page from './page';
import Agent from '../utils/agent';
import * as assert from 'assert';

export default class HomePage extends Page {
  constructor() {
    super();
  }

  async load( agent: Agent ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( '/dashboard' );
    assert( await this.$( '.mt-home-container' ) );
    await this.doneLoading();
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  async doneLoading() {
    await this.emptySelector( '.mt-loading' )
  }

  toggleLatestPostContent() {
    return this.page.click( '.mt-post-expand-btn' );
  }

  clickEditLatest() {
    return this.page.click( '.mt-edit-latest' );
  }

  async getRecentPosts() {
    return await this.page.$$eval( '.mt-recent-post', e => {
      return Array.from( e ).map( row => {
        return {
          heading: row.querySelector( '.mt-recent-post-title' )!.textContent,
          author: row.querySelector( '.mt-recent-post-author' )!.textContent,
          created: row.querySelector( '.mt-recent-post-date' )!.textContent
        };
      } )
    } ) as {
      heading: string;
      author: string;
      created: string;
    }[];
  }

  async isLatestPostExpanded() {
    return await this.page.$( '.mt-latest-post-content' ) ? true : false;
  }

  async hasLatestPost() {
    return await this.page.$( '.mt-latest-post' ) ? true : false;
  }

  async getLatestPostDetails() {
    return await this.page.$eval( '.mt-latest-post', ( e: HTMLElement ) => {
      return {
        heading: e.querySelector( '.mt-post-header-title' )!.textContent,
        created: e.querySelector( '.mt-post-header-date' )!.textContent,
        author: e.querySelector( '.mt-post-header-author' )!.textContent,
        avatar: ( e.querySelector( '.mt-avatar img' )! as HTMLImageElement ).src,
        zones: Array.from( e.querySelectorAll( '.mt-zone' ) ).map( subElm => {
          return {
            name: subElm.querySelector( 'h2' )!.textContent,
            content: subElm.querySelector( '.mt-zone-content' )!.textContent
          };
        } )
      }
    } ) as {
      heading: string;
      author: string;
      created: string;
      avatar: string;
      zones: { name: string; content: string }[];
    };
  }
}