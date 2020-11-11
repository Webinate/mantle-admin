import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { randomId } from '../../utils/misc';
import { Post } from 'mantle';
import AdminAgent from '../../utils/admin-agent';

let postPage = new PostsPage();
let admin: AdminAgent;
let post: Post;

describe('Testing the creation of inline styles: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();

    post = await admin.addPost({
      title: 'Anchor test',
      slug: randomId(),
      public: false,
    });

    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
  });

  after(async () => {
    await admin.removePost(post._id);
  });

  it('can type into the first element and select the first word', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.page.keyboard.type('all three styles combined');
    await postPage.elementsModule.highlightText(25, 0, 3);
  });

  it('can bold the first word', async () => {
    await postPage.elementsModule.clickInlineButton('bold');
    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements[0], '<p><b>all</b> three styles combined</p>');
  });

  it('can select the second word', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.elementsModule.highlightText(0, 1, 5);
  });

  it('can italic the second word', async () => {
    await postPage.elementsModule.clickInlineButton('italic');
    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements[0], '<p><b>all</b> <i>three</i> styles combined</p>');
  });

  it('can select the third word', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.elementsModule.highlightText(0, 1, 6);
  });

  it('can underline the third word', async () => {
    await postPage.elementsModule.clickInlineButton('underline');
    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements[0], '<p><b>all</b> <i>three</i> <u>styles</u> combined</p>');
  });

  it('can select the fourth word', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.elementsModule.highlightText(0, 1, 8);
  });

  it('can do all styles on the fourth word', async () => {
    await postPage.elementsModule.clickInlineButton('bold');
    await postPage.elementsModule.clickInlineButton('italic');
    await postPage.elementsModule.clickInlineButton('underline');
    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements[0], '<p><b>all</b> <i>three</i> <u>styles</u> <b><i><u>combined</u></i></b></p>');
  });
});
