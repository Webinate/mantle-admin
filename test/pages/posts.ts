import Page from './page';
import Agent from '../utils/agent';
import * as assert from 'assert';
import CategoryModule from './modules/categories';
import CommentsModule from './modules/comments';
import AppModule from './modules/app';
import MediaModule from './modules/media-nav';

export type PostProfile = {
  name: string;
  featuredImage: string;
  image: string;
}

export default class PostsPage extends Page {

  public categories: CategoryModule;
  public appModule: AppModule;
  public mediaModule: MediaModule;
  public commentsModule: CommentsModule;

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
    this.mediaModule = new MediaModule( this.page );
    this.commentsModule = new CommentsModule( this.page );
  }

  /**
   * Clicks the new post button and waits for the components to be on the dom
   */
  async clickNewPost() {
    await this.page.click( 'button.mt-new-post' );
    await this.page.waitFor( '#mt-post-title' );
  }

  async inEditMode() {
    const result = await this.page.$( '.mt-post-confirm' );
    if ( result )
      return true;
    else
      return false;
  }

  /**
   * Clicks the new post button and waits for the components to be on the dom
   */
  openPanel( which: 'categories' | 'tags' | 'meta' | 'featured' | 'templates' ) {
    if ( which === 'categories' )
      return this.page.click( '.mt-categories-panel .mt-panel-expand' );
    else if ( which === 'tags' )
      return this.page.click( '.mt-tags-panel .mt-panel-expand' );
    else if ( which === 'meta' )
      return this.page.click( '.mt-meta-panel .mt-panel-expand' );
    else if ( which === 'featured' )
      return this.page.click( '.mt-featured-panel .mt-panel-expand' );
    else if ( which === 'templates' )
      return this.page.click( '.mt-templates-panel .mt-panel-expand' );
  }

  /**
   * Clicks the confirm btn to save or update
   */
  async clickConfirm() {
    await this.page.click( '.mt-post-confirm' );
    await this.doneLoading()
  }

  /**
   * Clicks the back button
   */
  async clickBack() {
    await this.page.click( '#mt-to-post-list' );
    await this.emptySelector( '.mt-post-confirm' );
  }

  async isPreview() {
    const result = await this.page.$( '#mt-post-preview' );
    return result ? true : false;
  }

  async previewDetails() {
    const result: {
      avatar: string;
      author: string;
      title: string;
      content: string;
    } = await this.page.$eval( '#mt-post-preview', elm => {
      return {
        avatar: ( elm.querySelector( '.mt-preview-author-avatar img' ) as HTMLImageElement ).src,
        author: ( elm.querySelector( '#mt-preview-author' ) as HTMLDivElement ).textContent,
        title: ( elm.querySelector( '#mt-preview-title' ) as HTMLDivElement ).textContent,
        content: ( elm.querySelector( '#mt-preview-content' ) as HTMLDivElement ).innerHTML
      }
    } );

    return result;
  }

  async clickUpdate() {
    await this.page.click( '.mt-post-confirm' );
    await this.doneLoading()
  }

  async updateElmContent( index: number, val: string ) {
    await this.page.click( `.mt-element:nth-child(${ index + 1 })` );
    await this.page.$( '.mt-element.active.focussed.cursor' );
    await this.sleep( 500 );
    await this.page.keyboard.down( 'Control' );
    await this.page.keyboard.press( 'KeyA' );
    await this.page.keyboard.up( 'Control' );
    await this.page.keyboard.press( 'Delete' );
    await this.page.keyboard.type( val, { delay: 10 } );
    await this.page.keyboard.press( 'Escape' );
    await this.doneLoading();
    await this.emptySelector( '.mt-element.active.focussed.cursor' );
  }

  async getElmContent( index: number ) {
    return this.page.$eval( `.mt-element:nth-child(${ index + 1 })`, ( elm: HTMLElement ) => elm.innerHTML );
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
      await handle!.type( val, { delay: 10 } );
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
      await this.page.type( '.mt-user-autocomplete input', val, { delay: 50 } );
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
    const label = await this.page.$eval( '.mt-visibility-toggle-label', elm => elm.textContent );
    let isPublic = false;

    if ( label === 'Post is public' )
      isPublic = true;

    if ( val === undefined ) {
      return isPublic;
    } else {
      if ( val && !isPublic )
        await this.page.click( '.mt-visibility-toggle-label' );
      else if ( !val && isPublic )
        await this.page.click( '.mt-visibility-toggle-label' );
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

  getFeaturedImg(): Promise<string> {
    return this.page.$eval( '#mt-featured-img img', ( img: HTMLImageElement ) => img.src );
  }

  async clickFeaturedImg() {
    await this.page.click( '#mt-featured-img' );
    await this.page.waitFor( '.mt-volume-table' );
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
          name: child.querySelector( '.mt-post-name' )!.textContent,
          image: child.querySelector( '.mt-post-info img' )!.getAttribute( 'src' ),
          featuredImage: child.querySelector( '.mt-post-featured-thumb img' )!.getAttribute( 'src' )
        }
      } )
    } );
  }

  /**
   * Filters the posts by title and content
   * @param search The filter text
   */
  async filter( search: string ) {
    await this.page.click( '#mt-posts-filter' );
    await this.page.$eval( '#mt-posts-filter', ( elm: HTMLInputElement ) => elm.value = '' );
    await this.page.type( '#mt-posts-filter', search );
    await this.page.click( '.mt-posts-search' );
    await this.doneLoading();
  }

  /**
   * Open or close the filter options
   */
  async toggleFilterOptionsPanel( open: boolean ) {
    await this.page.click( '.mt-posts-filter' );
    if ( open )
      await this.page.waitFor( '.mt-filters-panel.open' );
    else
      await this.page.waitFor( '.mt-filters-panel.closed' );
  }

  /**
   * Click the sort order toggle
   */
  async clickSortOrder() {
    await this.page.click( '.mt-sort-order' );
    await this.doneLoading();
  }

  /**
   * Select what to sort by
   */
  async selectSortType( type: 'created' | 'modified' | 'title' ) {
    await this.page.click( '.mt-filter-sortby' );
    await this.page.waitFor( '.mt-filter-sortby-modified' );
    await this.page.click( `.mt-filter-sortby-${ type }` );
    await this.emptySelector( '.mt-filter-sortby-modified' );
    await this.doneLoading();
  }

  /**
   * Select the visibility filter
   */
  async selectVisibility( type: 'all' | 'public' | 'private' ) {
    await this.page.click( '.mt-filter-visibility' );
    await this.page.waitFor( '.mt-filter-visibility-public' );
    await this.page.click( `.mt-filter-visibility-${ type }` );
    await this.emptySelector( '.mt-filter-visibility-public' );
    await this.doneLoading();
  }

  /**
   * Select the user filter
   */
  async selectUserFilter( val?: string ) {
    await this.user( val );
    await this.doneLoading();
  }

  /**
   * Selects by title
   * @param title The title of the post to select
   * @param multiple If true, its the same as holding down shift
   */
  async selectPost( title: string, multiple: boolean = false ) {
    const index = await this.page.$$eval( `.mt-post`, ( nodes, title: string ) => {
      const index = Array.from( nodes ).findIndex( elm => elm.querySelector( '.mt-post-name' )!.textContent === title )
      return index;
    }, title );

    if ( multiple )
      await this.page.keyboard.down( 'Shift' );
    await this.page.click( `.mt-post:nth-child(${ index + 1 })` );
    if ( multiple )
      await this.page.keyboard.up( 'Shift' );
  }

  async confirmDelete() {
    await this.page.waitFor( `.mt-confirm-delpost` );
    await this.page.click( `.mt-confirm-delpost` );
    await this.emptySelector( `.mt-confirm-delpost` );
  }

  /**
   * Deletes the select post
   */
  async deleteSelectedPost() {
    await this.page.hover( `.mt-post.selected` );
    await this.page.waitFor( `.mt-post.selected .mt-post-delete` );
    await this.page.click( `.mt-post.selected .mt-post-delete` );
    await this.confirmDelete();
    await this.doneLoading();
  }

  /**
   * Deletes all the selected posts
   */
  async deleteMultiplePosts() {
    await this.emptySelector( '.mt-posts-delete-multi[disabled]' );
    await this.page.click( `.mt-posts-delete-multi` );
    await this.confirmDelete();
    await this.doneLoading();
  }
}