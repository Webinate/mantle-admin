import Page from './page';
import Agent from '../utils/agent';

export type PostProfile = {
  name: string;
  content: string;
  image: string;
}

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
   * Gets all of the current posts as an array
   */
  getPosts(): Promise<PostProfile[]> {
    return this.page.$eval( `.mt-posts`, elm => {
      return Array.from( elm.children ).map( child => {
        return {
          name: child.querySelector( '.mt-post-name' ).textContent,
          content: child.querySelector( '.mt-post-content' ).textContent,
          image: child.querySelector( '.mt-post-info img' ).getAttribute( 'src' )
        }
      } )
    } );
  }
}