import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { randomId } from '../../utils/misc';
import { Post } from 'mantle';
import { ElementType } from '../../pages/modules/elements';
import AdminAgent from '../../utils/admin-agent';

let postPage = new PostsPage();
let admin: AdminAgent;
let post: Post;

describe('Testing the creation of elements: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();

    post = await admin.addPost({
      title: 'Test Post',
      brief: 'Oh my brief',
      slug: randomId(),
      public: false,
    });

    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
  });

  after(async () => {
    if (post) await admin.removePost(post._id);
  });

  it('does have one element already present', async () => {
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 1);
  });

  it('does edit the first paragraph and creates a new one on enter', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.elementsModule.typeAndPress('Paragraph 1');
    await postPage.elementsModule.waitForActivation(1);

    // Create a new paragraph and hit escape
    await postPage.elementsModule.typeAndPress('Paragraph 2', 'Escape');

    // Hitting escape should remove focus
    await postPage.elementsModule.waitForNoFocus();
    assert.deepEqual(await postPage.elementsModule.elmHasFocus(), false);

    // Should have 3 paragraphs
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 2);
    assert.deepEqual(elements[0], '<p>Paragraph 1</p>');
    assert.deepEqual(elements[1], '<p>Paragraph 2</p>');
  });

  it('does create a new paragraph on enter after a selected element index', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.page.keyboard.press('Enter');
    await postPage.elementsModule.waitForActivation(1);
    await postPage.elementsModule.typeAndPress('Paragraph 1 - a', 'Escape');
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 3);
    assert.deepEqual(elements[0], '<p>Paragraph 1</p>');
    assert.deepEqual(elements[1], '<p>Paragraph 1 - a</p>');
    assert.deepEqual(elements[2], '<p>Paragraph 2</p>');
  });

  it('does create a new paragraph after a selection when we click on the p button', async () => {
    await postPage.elementsModule.activateAt(1);
    await postPage.elementsModule.clickNewParagraph();
    await postPage.elementsModule.waitForActivation(2);
    await postPage.elementsModule.typeAndPress('Paragraph 1 - b', 'Escape');
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 4);
    assert.deepEqual(elements[0], '<p>Paragraph 1</p>');
    assert.deepEqual(elements[1], '<p>Paragraph 1 - a</p>');
    assert.deepEqual(elements[2], '<p>Paragraph 1 - b</p>');
    assert.deepEqual(elements[3], '<p>Paragraph 2</p>');
  });

  it('does not create a new paragraph when we press enter in a ul list', async () => {
    await postPage.elementsModule.clickNewList('ul');
    await postPage.elementsModule.waitForActivation(3);
    await postPage.elementsModule.typeAndPress('First item');
    await postPage.elementsModule.typeAndPress('Second item', 'Escape');
    await postPage.elementsModule.doneLoading();
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 5);
    assert.deepEqual(elements[0], '<p>Paragraph 1</p>');
    assert.deepEqual(elements[1], '<p>Paragraph 1 - a</p>');
    assert.deepEqual(elements[2], '<p>Paragraph 1 - b</p>');
    assert.deepEqual(elements[3], '<ul><li>First item</li><li>Second item</li></ul>');
    assert.deepEqual(elements[4], '<p>Paragraph 2</p>');
  });

  it('does not create a new paragraph when we press enter in a ol list', async () => {
    await postPage.elementsModule.clickNewList('ol');
    await postPage.elementsModule.waitForActivation(4);
    await postPage.elementsModule.typeAndPress('First item');
    await postPage.elementsModule.typeAndPress('Second item', 'Escape');
    await postPage.elementsModule.doneLoading();
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 6);
    assert.deepEqual(elements[0], '<p>Paragraph 1</p>');
    assert.deepEqual(elements[1], '<p>Paragraph 1 - a</p>');
    assert.deepEqual(elements[2], '<p>Paragraph 1 - b</p>');
    assert.deepEqual(elements[3], '<ul><li>First item</li><li>Second item</li></ul>');
    assert.deepEqual(elements[4], '<ol><li>First item</li><li>Second item</li></ol>');
    assert.deepEqual(elements[5], '<p>Paragraph 2</p>');
  });

  it('does create a header in the middle', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.elementsModule.selectBlockType('header-3');
    await postPage.elementsModule.waitForActivation(1);
    await postPage.elementsModule.typeAndPress('HEADING', 'Escape');
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements[1], '<h3>HEADING</h3>');
  });

  it("does allow empty blocks from the menu and they're valid html", async () => {
    const toTest: { type: ElementType; code: string }[] = [
      { type: 'header-1', code: 'h1' },
      { type: 'header-2', code: 'h2' },
      { type: 'header-3', code: 'h3' },
      { type: 'header-4', code: 'h4' },
      { type: 'header-5', code: 'h5' },
      { type: 'header-6', code: 'h6' },
      { type: 'code', code: 'pre' },
      { type: 'paragraph', code: 'p' },
    ];

    for (let i = 0, l = toTest.length; i < l; i++) {
      await postPage.elementsModule.activateAt(0);
      await postPage.elementsModule.selectBlockType(toTest[i].type);
      await postPage.elementsModule.waitForActivation(1);
      await postPage.elementsModule.pressEscape();
      await postPage.elementsModule.waitForNoFocus();

      // Check order
      const elements = await postPage.elementsModule.htmlArray();
      assert.deepEqual(elements[1], `<${toTest[i].code}></${toTest[i].code}>`);
    }
  });

  it("does allow blocks with text from the menu and they're valid html", async () => {
    const toTest: { type: ElementType; code: string }[] = [
      { type: 'header-1', code: 'h1' },
      { type: 'header-2', code: 'h2' },
      { type: 'header-3', code: 'h3' },
      { type: 'header-4', code: 'h4' },
      { type: 'header-5', code: 'h5' },
      { type: 'header-6', code: 'h6' },
      { type: 'code', code: 'pre' },
      { type: 'paragraph', code: 'p' },
    ];

    for (let i = 0, l = toTest.length; i < l; i++) {
      await postPage.elementsModule.activateAt(0);
      await postPage.elementsModule.selectBlockType(toTest[i].type);
      await postPage.elementsModule.waitForActivation(1);
      await postPage.elementsModule.typeAndPress('test', 'Escape');
      await postPage.elementsModule.waitForNoFocus();

      // Check order
      const elements = await postPage.elementsModule.htmlArray();
      assert.deepEqual(elements[1], `<${toTest[i].code}>test</${toTest[i].code}>`);
    }
  });
});
