import utils from '../../utils';
import { Page } from 'puppeteer';
import { IConfig } from 'modepress/src';

export default class Module {
  public page: Page;
  public config: IConfig;

  constructor( page: Page ) {
    this.page = page;
    this.config = utils.config;
  }

  async emptySelector( selector: string ) {
    return this.page.waitForFunction( `document.querySelector("${ selector }") == null` );
  }

  async input( selector: string, val?: string ) {
    if ( val === undefined ) {
      return this.page.$eval( selector, ( elm: HTMLInputElement ) => elm.value );
    }
    else {
      await this.page.$eval( selector, ( elm: HTMLInputElement ) => {
        elm.focus();
        elm.value = '';
      } );

      await this.page.type( selector, val, { delay: 50 } );
    }
  }

  sleep( milliseconds: number ) {
    return this.page.waitFor( milliseconds );
  }
}