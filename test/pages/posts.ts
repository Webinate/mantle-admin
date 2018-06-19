import Page from './page';
import Agent from '../utils/agent';
import * as assert from 'assert';
import CategoryModule from './modules/categories';
import AppModule from './modules/app';

export type PostProfile = {
  name: string;
  featuredImage: string;
  image: string;
}

export default class PostsPage extends Page {

  public categories: CategoryModule;
  public appModule: AppModule;

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
    this.appModule = new AppModule( this.page );
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

  async clickUpdate() {
    await this.page.click( '.mt-post-confirm' );
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

  async user( val?: string ) {
    if ( val === undefined ) {
      return this.page.$eval( '.my-user-picker-label', elm => elm.textContent )
    }
    else {
      await this.page.waitFor( '.my-user-picker-btn' );
      await this.page.click( '.my-user-picker-btn' );
      await this.page.waitFor( '.mt-user-autocomplete input' );
      await this.textfield( '.mt-user-autocomplete', val );
      await this.page.waitFor( '.mt-user-drop-item:first-child' );
      await this.page.click( '.mt-user-drop-item:first-child' );
      await this.emptySelector( '.mt-user-autocomplete input' )
    }
  }

  /**
   * Gets or sets the post title
   */
  title( val?: string ) { return this.input( '#mt-post-title', val ) }

  /**
   * Gets or sets the post brief
   */
  brief( val?: string ) { return this.textfield( '#mt-post-desc', val, true ) }

  /**
   * Gets or sets the post brief
   */
  async isPublic( val?: boolean ) {
    const label = await this.page.$eval( '.mt-visibility-toggle label', elm => elm.textContent );
    let isPublic = false;

    if ( label === 'Post is Public' )
      isPublic = true;

    if ( val === undefined ) {
      return isPublic;
    } else {
      if ( val && !isPublic )
        await this.page.click( '.mt-visibility-toggle input' );
      else if ( !val && isPublic )
        await this.page.click( '.mt-visibility-toggle input' );
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
    await this.emptySelector( '.mt-loading' )
    await this.emptySelector( '.mt-cat-loading' )
  }

  /**
   * Gets all of the current posts as an array
   */
  getPosts( onlySelectedPosts: boolean = false ): Promise<PostProfile[]> {
    return this.page.$$eval( `.mt-post${ onlySelectedPosts ? '.selected' : '' }`, nodes => {
      return Array.from( nodes ).map( child => {
        return {
          name: child.querySelector( '.mt-post-name' ).textContent,
          image: child.querySelector( '.mt-post-info img' ).getAttribute( 'src' ),
          featuredImage: child.querySelector( '.mt-post-featured-thumb img' ).getAttribute( 'src' )
        }
      } )
    } );
  }

  async selectPost( title: string ) {
    const index = await this.page.$$eval( `.mt-post`, ( nodes, title: string ) => {
      const index = Array.from( nodes ).findIndex( elm => elm.querySelector( '.mt-post-name' ).textContent === title )
      return index;
    }, title );

    await this.page.click( `.mt-post:nth-child(${ index + 1 })` );
  }

  /**
   * Deletes the select post
   */
  async deleteSelectedPost() {
    await this.page.hover( `.mt-post.selected` );
    await this.page.waitFor( `.mt-post.selected .mt-post-delete` );
    await this.page.click( `.mt-post.selected .mt-post-delete` );
    await this.page.waitFor( `.mt-post-del-dialog .mt-confirm-delpost` );
    await this.page.click( `.mt-post-del-dialog .mt-confirm-delpost` );
    await this.emptySelector( `.mt-post-del-dialog .mt-confirm-delpost` );
    await this.doneLoading();
  }
}