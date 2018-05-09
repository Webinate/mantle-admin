import Page from './page';
import Agent from '../utils/agent';
import * as assert from 'assert';
import CategoryModule from './modules/categories';

export type PostProfile = {
  name: string;
  featuredImage: string;
  image: string;
}

export default class PostsPage extends Page {

  public categories: CategoryModule;

  constructor() {
    super();
  }

  async load( agent: Agent, path = '/dashboard/posts' ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( path );

    assert( await this.$( '.mt-post-container' ) );
    await this.doneLoading();

    this.categories = new CategoryModule( this.page );
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

  async inEditMode() {
    const result = await this.page.$( '.mt-post-confirm' );
    if ( result )
      return true;
    else
      return false;
  }

  /**
   * Clicks the confirm btn to save or update
   */
  async clickConfirm() {
    await this.page.click( '.mt-post-confirm' );
    await this.page.waitFor( '.mt-new-post button' );
    await this.doneLoading()
  }

  /**
   * Gets or sets the content of the tiny editor
   */
  async content( val?: string ) {
    const frames = await this.page.frames();

    if ( val === undefined ) {
      return frames[ 1 ].$eval( '#tinymce', ( tiny: HTMLElement ) => tiny.textContent )
    }
    else {
      await frames[ 1 ].$eval( '#tinymce', ( tiny: HTMLElement ) => {
        tiny.textContent = '';
        tiny.focus();
      } );

      const handle = await frames[ 1 ].$( '#tinymce' );
      await handle.type( val, { delay: 10 } );
    }
  }

  /**
   * Gets or sets the post title
   */
  title( val?: string ) { return this.input( '#mt-post-title', val ) }

  /**
   * Gets the static slug
   */
  async getSlug(): Promise<string> {
    const titleSelector = '.mt-slug-value';
    return await this.page.$eval( titleSelector, ( elm: HTMLElement ) => {
      return elm.textContent;
    } );
  }

  /**
   * Sets the slug of the post
   */
  async setSlug( val: string ) {
    const slugInput = 'input[name=mt-slug]';
    await this.click( '.mt-slug-btn.mt-edit-slug' );
    await this.waitFor( slugInput );
    await this.page.type( slugInput, val, { delay: 10 } )
    await this.click( '.mt-slug-btn.mt-slug-save' );
    await this.waitFor( '.mt-slug-btn.mt-edit-slug' );
  }

  /**
   * Adds a new tag
   */
  async addTag( val: string ) {
    const inputSelector = '#mt-add-new-tag';
    await this.input( inputSelector, val );
    await this.page.click( '#mt-add-tag' );
  }

  /**
   * Removes a tag by name
   */
  async removeTag( val: string ) {
    const tags: string[] = await this.page.$$eval( '.mt-tag-chip span', list => {
      return Array.from( list ).map( ( item: HTMLElement ) => item.textContent )
    } );

    if ( tags.indexOf( val ) === -1 )
      throw new Error( 'Tag does not exist' );

    await this.page.click( `.mt-tag-chip:nth-child(${ tags.indexOf( val ) + 1 }) svg` );
  }

  /**
   * Checks if the post has a tag
   */
  async hasTag( val: string ) {
    const tags: string[] = await this.page.$$eval( '.mt-tag-chip span', list => {
      return Array.from( list ).map( ( item: HTMLElement ) => item.textContent )
    } );

    return tags.includes( val );
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  async doneLoading() {
    await this.page.waitForFunction( 'document.querySelector(".mt-loading") == null' );
    await this.page.waitForFunction( 'document.querySelector(".mt-cat-loading") == null' );
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