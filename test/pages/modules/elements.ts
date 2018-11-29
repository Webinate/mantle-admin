import Module from "./module";
import App from "./app";
import { Page } from 'puppeteer';

/**
 * A module for interacting with elements
 */
export default class ElementsModule extends Module {
  public appModule: App;

  constructor( page: Page ) {
    super( page );
    this.appModule = new App( page );
  }

  doneLoading() {
    return this.emptySelector( '.mt-loading' );
  }

  /**
   * Gets an element's html at an index
   */
  htmlAt( index: number ): Promise<string> {
    return this.page.$eval( `.mt-element:nth-child(${ index + 1 })`, ( elm: HTMLElement ) => elm.innerHTML );
  }

  /**
   * Gets all element's html as a string array
   */
  htmlArray(): Promise<string[]> {
    return this.page.$$eval( `.mt-element`, ( elms ) => Array.from( elms ).map( ( e: HTMLElement ) => e.innerHTML ) );
  }

  async elmHasFocus() {
    const result = await this.page.$( `.active.focussed.cursor` );
    return result ? true : false;
  }

  async activateAt( index: number ) {
    await this.page.click( `.mt-element:nth-child(${ index + 1 })` );
    await this.page.waitFor( `.mt-element:nth-child(${ index + 1 }).active.focussed.cursor` );

    // Give the browser a moment to create the focus
    await this.sleep( 500 );
  }

  async clickNewParagraph() {
    await this.page.click( `#mt-create-paragraph` );
    await this.doneLoading();
  }

  async clickNewList( type: 'ul' | 'ol' = 'ul' ) {
    if ( type === 'ul' )
      await this.page.click( `#mt-create-elm-list-0` );
    else
      await this.page.click( `#mt-create-elm-list-1` );

    await this.doneLoading();
  }

  waitForActivation( index: number ) {
    return this.page.waitFor( `.mt-element:nth-child(${ index + 1 }).active.focussed.cursor` );
  }

  waitForNoFocus() {
    return this.emptySelector( `.focussed.cursor` );
  }

  async typeAndPress( val: string, key: string = 'Enter' ) {
    await this.page.keyboard.type( val, { delay: 60 } );
    await this.page.keyboard.press( key );
    await this.doneLoading()
  }
}