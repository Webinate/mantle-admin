import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { randomId } from '../../utils/misc';
import { Post } from 'mantle';
import { ElementType } from '../../../../../src/core/enums';
import AdminAgent from '../../utils/admin-agent';

let postPage = new PostsPage();
let admin: AdminAgent;
let post: Post;

describe('Testing the view preview button for admins: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();

    const adminUser = await admin.getUser(admin.username)!;
    const templatePage = await admin.getTemplates();

    post = await admin.addPost({
      title: 'Test Post',
      author: adminUser!._id,
      slug: randomId(),
      public: false,
    });

    await admin.changeTemplate(templatePage.data[1]._id, post.document._id);
    await admin.addElement({ zone: 'left', html: 'Left', type: ElementType.paragraph }, post.document._id);
    await admin.addElement({ zone: 'right', html: 'Right', type: ElementType.paragraph }, post.document._id);
  });

  after(async () => {
    await admin.removePost(post._id);
  });

  it('does show a post preview to admin users when preview clicked', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    assert.deepEqual(await postPage.isPreview(), false);
    await postPage.gotoPreviewMode(true);
    assert.deepEqual(await postPage.isPreview(), true);
  });

  it('has 2 empty zones as its not ', async () => {
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual(previewDetails.author, admin.username);
    assert.deepEqual(previewDetails.title, 'Test Post');
    assert.deepEqual(previewDetails.zones.length, 2);
    assert.deepEqual(previewDetails.contents[0], '');
    assert.deepEqual(previewDetails.contents[1], '');
  });

  it('does create a draft after we update the post', async () => {
    await postPage.clickBack(true);
    await postPage.clickUpdate();
    await postPage.gotoPreviewMode(true);
  });

  it('does have valid a valid preview', async () => {
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual(previewDetails.author, admin.username);
    assert.deepEqual(previewDetails.title, 'Test Post');
    assert.deepEqual(previewDetails.zones.length, 2);
    assert.deepEqual(previewDetails.contents[0], '<p>Left</p>');
    assert.deepEqual(previewDetails.contents[1], '<p>Right</p>');
  });

  it('does go back to editing a post when we click back', async () => {
    assert.deepEqual(await postPage.isPreview(), true);
    await postPage.gotoPreviewMode(false);
    assert.deepEqual(await postPage.isPreview(), false);
    assert.deepEqual(await postPage.title(), 'Test Post');
  });
});
