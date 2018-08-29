import Page from 'modepress/clients/modepress-admin/test/pages/page';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import * as assert from 'assert';
import AppModule from 'modepress/clients/modepress-admin/test/pages/modules/app';

export type PostProfile = {
  name: string;
  featuredImage: string;
  image: string;
}

export default class PostsPage extends Page {
  public appModule: AppModule;

  constructor() {
    super();
  }

  async load( agent: Agent, path = '/dashboard/media' ) {
    await super.load();

    if ( agent )
      await this.setAgent( agent );

    await super.to( path );

    assert( await this.$( '.mt-media-container' ) );
    await this.doneLoading();

    this.appModule = new AppModule( this.page );
  }

  /**
   * Clicks the new volume button
   */
  async clickNewVolume() {
    await this.page.click( '#mt-new-volume' );
    await this.page.waitFor( '#mt-new-volume-form' );
    const path = await this.page.evaluate( () => window.location.pathname )
    assert.deepEqual( path, '/dashboard/media/new' );
  }

  volumeName( val?: string ) {
    return this.input( '#mt-volume-name', val );
  }

  volumeMemory( val?: string ) {
    return this.input( '#mt-volume-memory', val );
  }

  async volumeMemoryEnabled() {
    return ( await this.page.$( 'disabled#mt-volume-memory' ) ? true : false );
  }

  async volumeNameError() {
    const result = await this.page.$( '#mt-volume-name-error' );
    if ( !result )
      return null;

    return this.page.$eval( '#mt-volume-name-error', elm => elm.textContent );
  }

  async volumeMemoryError() {
    const result = await this.page.$( '#mt-volume-memory-error' );
    if ( !result )
      return null;

    return this.page.$eval( '#mt-volume-memory-error', elm => elm.textContent );
  }

  clickNext() {
    return this.click( '#mt-vol-next' );
  }

  clickBack() {
    return this.click( '#mt-vol-back' );
  }

  getVolumes() {
    return this.page.$$eval( `.mt-volume-row`, elm => {
      return Array.from( elm ).map( row => {
        return {
          type: row.querySelector( '.mt-volume-type-local' ) ? 'local' : 'google',
          name: row.querySelector( '.mt-volume-name' ).textContent,
          memory: row.querySelector( '.mt-volume-memoryaloc' ).textContent,
          date: row.querySelector( '.mt-volume-created' ).textContent
        }
      } )
    } ) as Promise<{
      type: 'google' | 'local';
      name: string;
      memory: string;
      date: string;
    }[]>;
  }

  async clickVolumeFilter( type: 'name' | 'created' | 'memory' ) {
    await this.page.click( `.mt-volume-header-${ type }` );
    await this.doneLoading();
  }

  async selectVolume( name: string ) {
    const index: number = await this.page.$$eval( `.mt-volume-name`, ( elements, name ) => {
      const elmArr = Array.from( elements );
      return elmArr.findIndex( e => e.textContent === name )
    }, name );

    if ( index === -1 )
      throw new Error( `${ name } was not found` );

    const handles = await this.page.$$( `.mt-volume-name` );
    await handles[ index ].click();
  }

  async clickDeleteVolume() {
    await this.page.click( '#mt-delete-volume' );
    await this.page.waitFor( '#mt-media-confirm-btn' );
  }

  async cancelDelete() {
    await this.page.click( '#mt-media-cancel-btn' );
    await this.emptySelector( '#mt-media-cancel-btn' );
  }

  async confirmDelete() {
    await this.page.click( '#mt-media-confirm-btn' );
    await this.emptySelector( '#mt-media-confirm-btn' );
    await this.doneLoading();
  }

  selectAll() {
    return this.page.click( '#mt-select-all' );
  }

  /**
   * Waits for the page to not be in a busy state
   */
  async doneLoading() {
    await this.emptySelector( '.mt-loading' )
  }
}