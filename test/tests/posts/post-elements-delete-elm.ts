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

describe('Testing the deletion of elements: ', function () {
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

  it('does create 3 paragraphs', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.elementsModule.typeAndPress('Para 1', 'Enter');
    await postPage.elementsModule.waitForActivation(1);

    await postPage.elementsModule.typeAndPress('Para 2', 'Enter');
    await postPage.elementsModule.waitForActivation(2);

    await postPage.elementsModule.typeAndPress('Para 3', 'Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 3);
  });

  it('can delete the middle paragrpah using the button', async () => {
    await postPage.elementsModule.activateAt(1);
    await postPage.elementsModule.clickDelete();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 2);

    assert.deepEqual(elements[0], '<p>Para 1</p>');
    assert.deepEqual(elements[1], '<p>Para 3</p>');
  });

  it('can delete multiple paragrpahs', async () => {
    await postPage.elementsModule.activateAt(0);
    await postPage.page.keyboard.down('Shift');
    await postPage.elementsModule.clickAt(1);
    await postPage.page.keyboard.up('Shift');

    assert.deepEqual(await postPage.elementsModule.numSelectedElms(), 2);
    await postPage.elementsModule.clickDelete();
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 0);
  });
});
