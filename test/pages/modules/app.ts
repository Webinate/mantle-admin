import Module from './module';
import { Page } from 'puppeteer';

/**
 * A module for interacting with app level interactions
 */
export default class AppModule extends Module {
  constructor(page: Page) {
    super(page);
  }

  async closeSnackMessage() {
    await this.page.waitFor('.mt-response-message.mt-snack-open');
    await this.page.waitFor(500);
    await this.page.click('#mt-close-snackbar-btn');
    await this.page.waitFor('.mt-response-message.mt-snack-closed');
    await this.page.waitForFunction('document.querySelector("#mt-close-snackbar-btn") == null');
  }

  async getSnackMessage(): Promise<string> {
    await this.page.waitFor('.mt-response-message.mt-snack-open');
    return this.page.$eval('#mt-close-snackbar-msg', (elm) => elm.textContent);
  }
}
