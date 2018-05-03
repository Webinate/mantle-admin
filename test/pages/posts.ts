import Page from './page';
import Agent from '../utils/agent';
import * as assert from 'assert';

export type PostProfile = {
  name: string;
  featuredImage: string;
  image: string;
}

export default class PostsPage extends Page {
  constructor() {
    super();
  }

  async load( agent: Agent, path = '/dashboard/posts' ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( path );

    assert( await this.$( '.mt-post-container' ) );
  }

  /**
   * Clicks the new post button and waits for the components to be on the dom
   */
  async clickNewPost() {
    await this.page.click( '.mt-new-post button' );
    await this.page.waitFor( '#mt-post-title' );
    const path = await this.page.evaluate( () => window.location.pathname )
    assert.deepEqual( path, '/dashboard/posts/new' );
  }

  /**
   * Gets or sets the post title
   */
  async title( val?: string ): Promise<string | void> {
    const titleSelector = '#mt-post-title';

    if ( val === undefined )
      return await this.page.$eval( titleSelector, ( elm: HTMLInputElement ) => {
        return elm.value;
      } )
    else {
      await this.page.focus( titleSelector );
      await this.page.evaluate( ( data ) => {
        document.querySelector( data ).value = '';
      }, titleSelector );

      return this.page.type( titleSelector, val, { delay: 10 } );
    }
  }

  /**
   * Gets the static slug
   */
  async getSlug(): Promise<string> {
    const titleSelector = '.mt-slug-value';
    return await this.page.$eval( titleSelector, ( elm: HTMLElement ) => {
      return elm.textContent;
    } );
  }

  async setSlug( val: string ) {
    const slugInput = 'input[name=mt-slug]';
    await this.click( '.mt-slug-btn.mt-edit-slug' );
    await this.waitFor( slugInput );
    await this.page.type( slugInput, val, { delay: 10 } )
    await this.click( '.mt-slug-btn.mt-slug-save' );
    await this.waitFor( '.mt-slug-btn.mt-edit-slug' );
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  doneLoading() {
    return this.page.waitForFunction( 'document.querySelector(".mt-loading") == null' );
  }

  /**
   * Gets all of the current posts as an array
   */
  getPosts(): Promise<PostProfile[]> {
    return this.page.$eval( `.mt-posts`, elm => {
      return Array.from( elm.children ).map( child => {
        return {
          name: child.querySelector( '.mt-post-name' ).textContent,
          image: child.querySelector( '.mt-post-info img' ).getAttribute( 'src' ),
          featuredImage: child.querySelector( '.mt-post-featured-thumb img' ).getAttribute( 'src' )
        }
      } )
    } );
  }
}