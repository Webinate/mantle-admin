import Module from "./module";
import { Page } from 'puppeteer';

/**
 * A module for interacting with app level interactions
 */
export default class AppModule extends Module {
  constructor( page: Page ) {
    super( page );
  }

  async closeSnackMessage() {
    await this.page.waitFor( '.mt-response-message[open]' );
    await this.page.waitFor( 500 );
    await this.page.click( '.mt-response-message button' );
    await this.page.waitFor( '.mt-response-message.mt-snack-closed' )
  }

  async getSnackMessage() {
    await this.page.waitFor( '.mt-response-message[open]' );
    return this.page.$eval( '.mt-response-message > div > div > span', elm => elm.textContent );
  }
}