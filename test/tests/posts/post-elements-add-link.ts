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

describe('Testing the creation of links in elements: ', function () {
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

  it('does not show the anchor modal if nothing is selected', async () => {
    await postPage.elementsModule.clickAnchor();
    assert.deepEqual(await postPage.elementsModule.isAnchorModalOpen(), false);
  });

  it('can type into the first element and selection a portion of text', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.page.keyboard.type('this is a link bro');
    await postPage.elementsModule.highlightText(8, 0, 4);
  });

  it('can click on anchor button and now shows modal', async () => {
    await postPage.elementsModule.clickAnchor();
    assert.deepEqual(await postPage.elementsModule.isAnchorModalOpen(), true);
  });

  it('sets the link and verifies the html is correct', async () => {
    await postPage.elementsModule.setLinkUrl('https://google.com');
    await postPage.page.keyboard.press('Escape');
    await postPage.elementsModule.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 1);
    assert.deepEqual(elements[0], '<p>this is a <a href="https://google.com">link</a> bro</p>');
  });
});
