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

describe('Testing the creation of generic html elements: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    post = await admin.addPost({
      title: 'generic test',
      slug: randomId(),
      public: false,
    });

    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
  });

  after(async () => {
    await admin.removePost(post._id);
  });

  it('does create and show the html editor when the html button is clicked', async () => {
    await postPage.elementsModule.clickAddHtml();
    await postPage.elementsModule.waitForHtmlEditor(1);
    await postPage.elementsModule.htmlEditorIsActive();
    const curHtml = await postPage.elementsModule.htmlEditorText();
    assert.deepEqual(curHtml, '<div></div>');

    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 2);
    assert.deepEqual(elements[1], '<div></div>');
  });

  it('can set iframe element in generic html element', async () => {
    const html = '<iframe width="300" height="200" src="https://google.com"></iframe>';
    await postPage.elementsModule.activateAt(1, false);
    await postPage.elementsModule.waitForHtmlEditor(1);
    await postPage.elementsModule.htmlEditorIsActive();
    await postPage.elementsModule.htmlEditorText(html);

    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 2);
    assert.deepEqual(elements[1], html);
  });
});
