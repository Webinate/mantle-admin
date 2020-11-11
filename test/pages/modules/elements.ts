import Module from './module';
import App from './app';
import { Page } from 'puppeteer';

export type ElementType = 'header1' | 'header2' | 'header3' | 'header4' | 'header5' | 'header6' | 'code' | 'paragraph';

/**
 * A module for interacting with elements
 */
export default class ElementsModule extends Module {
  public appModule: App;

  constructor(page: Page) {
    super(page);
    this.appModule = new App(page);
  }

  doneLoading() {
    return this.emptySelector('.mt-loading');
  }

  clickAnchor() {
    return this.page.click('#mt-create-link');
  }

  async clickAddHtml() {
    await this.page.click('#mt-create-html');
    await this.doneLoading();
  }

  async htmlEditorIsActive() {
    const result = await this.page.$(`.active.focussed textarea`);
    return result ? true : false;
  }

  htmlEditorText(val?: string) {
    return this.input(`.active.focussed textarea`, val);
  }

  async setLinkUrl(url: string) {
    await this.input('#mt-link-address', url);
    await this.page.click('#mt-link-confirm');
    await this.emptySelector('#mt-link-confirm');
  }

  async isAnchorModalOpen() {
    const result = await this.page.$('#mt-link-confirm');
    return result ? true : false;
  }

  clickInlineButton(type: 'bold' | 'italic' | 'underline') {
    if (type === 'bold') return this.page.click('#mt-inline-bold');
    else if (type === 'italic') return this.page.click('#mt-inline-italic');
    if (type === 'underline') return this.page.click('#mt-inline-underline');
  }

  /**
   * Gets an element's html at an index
   */
  htmlAt(index: number): Promise<string> {
    return this.page.$eval(`.mt-element:nth-child(${index + 1})`, (elm: HTMLElement) => elm.innerHTML);
  }

  /**
   * Gets all element's html as a string array
   */
  htmlArray(): Promise<string[]> {
    return this.page.$$eval(`.mt-element`, (elms) => Array.from(elms).map((e: HTMLElement) => e.innerHTML));
  }

  async elmHasFocus() {
    const result = await this.page.$(`.active.focussed.cursor`);
    return result ? true : false;
  }

  async clickDelete() {
    await this.page.click(`#mt-delete-elms`);
    await this.doneLoading();
  }

  async selectBlockType(type: ElementType) {
    await this.page.click('#mt-draft-blocks');
    await this.page.waitFor(`#mt-create-${type}`);
    await this.page.click(`#mt-create-${type}`);
    await this.emptySelector(`#mt-create-${type}`);
  }

  async numSelectedElms() {
    const result = await this.page.$$(`.mt-element.active`);
    return result.length;
  }

  async activateAt(index: number, waitForFocus = true) {
    await this.page.click(`.mt-element:nth-child(${index + 1})`, { clickCount: 2 });
    if (waitForFocus) await this.page.waitFor(`.mt-element:nth-child(${index + 1}).active.focussed.cursor`);
    else await this.page.waitFor(`.mt-element:nth-child(${index + 1}).active`);

    // Give the browser a moment to create the focus
    await this.sleep(500);
  }

  async selectRange(startIndex: number, endIndex: number) {
    await this.page.keyboard.down('Shift');
    await this.clickAt(startIndex);
    await this.clickAt(endIndex);
    await this.page.keyboard.up('Shift');
    await this.waitForSelected(endIndex);
  }

  clickAt(index: number) {
    return this.page.click(`.mt-element:nth-child(${index + 1})`);
  }

  async getTabs() {
    const tabs: string[] = await this.page.$$eval(`.mt-editor-tab`, (tabElm) =>
      Array.from(tabElm).map((elm: HTMLElement) => elm.innerText)
    );
    return tabs;
  }

  async clickTab(tab: string) {
    const tabs = await this.getTabs();
    const elms = await this.page.$$('.mt-editor-tab');
    await elms[tabs.indexOf(tab)].click();
  }

  async getActiveTab() {
    const activeTab: string = await this.page.$eval(`.mt-editor-tab.active`, (elm: HTMLElement) => elm.innerText);
    return activeTab;
  }

  async clickNewParagraph() {
    await this.page.click(`#mt-create-paragraph-btn`);
    await this.doneLoading();
  }

  async highlightText(leftArrow: number, rightArrow: number, count: number) {
    for (let i = 0, l = leftArrow; i < l; i++) await this.page.keyboard.press('ArrowLeft');
    for (let i = 0, l = rightArrow; i < l; i++) await this.page.keyboard.press('ArrowRight');

    await this.page.keyboard.down('Shift');
    for (let i = 0, l = count; i < l; i++) await this.page.keyboard.press('ArrowRight');
    await this.page.keyboard.up('Shift');
  }

  async clickNewList(type: 'ul' | 'ol' = 'ul') {
    if (type === 'ul') await this.page.click(`#mt-create-list-0`);
    else await this.page.click(`#mt-create-list-1`);

    await this.doneLoading();
  }

  waitForActivation(index: number) {
    return this.page.waitFor(`.mt-element:nth-child(${index + 1}).active.focussed.cursor`);
  }

  waitForHtmlEditor(index: number) {
    return this.page.waitFor(`.mt-element:nth-child(${index + 1}).active textarea`);
  }

  waitForSelected(index: number) {
    return this.page.waitFor(`.mt-element:nth-child(${index + 1}).active`);
  }

  waitForNoFocus() {
    return this.emptySelector(`.focussed.cursor`);
  }

  async typeAndPress(val: string, key: string = 'Enter') {
    await this.page.keyboard.type(val, { delay: 60 });
    await this.page.keyboard.press(key);
    await this.doneLoading();
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
    await this.doneLoading();
  }
}
