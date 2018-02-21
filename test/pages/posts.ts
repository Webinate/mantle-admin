import Page from './page';
import Agent from '../utils/agent';

export default class PostsPage extends Page {
  constructor() {
    super();
  }

  async load( agent: Agent ) {
    await super.load();
    if ( agent )
      await this.setAgent( agent );
    return super.to( '/dashboard/posts' );
  }

  /**
   * Waits for the auth page to not be in a busy state
   */
  doneLoading() {
    return this.page.waitForFunction( 'document.querySelector(".mt-loading") == null' );
  }

  /**
   * Gets an array of user objects of visible the visible users { username: string; email: string; }
   */
  getPosts() {
    return this.page.$eval( `.mt-posts`, elm => {
      return Array.from( elm.children ).map( child => {
        return {
          name: child.querySelector( '.mt-post-name' ).textContent
        }
      } )
    } );
  }
}