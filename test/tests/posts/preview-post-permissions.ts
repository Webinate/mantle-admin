import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import { Post } from 'mantle';
import { ElementType } from '../../../../../src/core/enums';
import AdminAgent from '../../utils/admin-agent';

let postPage = new PostsPage();
let admin: AdminAgent, joe: Agent;
let publicPost: Post, multiZonePost: Post, privatePost: Post;

describe('Preview posts permissions: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const adminUser = await admin.getUser(admin.username);
    const templatePage = await admin.getTemplates();

    publicPost = await admin.addPost({
      title: 'Test Public Post',
      author: adminUser!._id,
      slug: randomId(),
      public: true,
    });

    multiZonePost = await admin.addPost({
      title: 'Test Public Post',
      author: adminUser!._id,
      slug: randomId(),
      public: true,
    });

    privatePost = await admin.addPost({
      title: 'Test Private Post',
      author: adminUser!._id,
      slug: randomId(),
      public: false,
    });

    // Add an element to the public post#
    await admin.updateElement(
      {
        _id: publicPost.document.elements![0]._id,
        html: "This is a post's <b>content</b>",
      },
      publicPost.document._id
    );
    await admin.changeTemplate(templatePage.data[1]._id, multiZonePost.document._id);
    await admin.addElement({ zone: 'left', html: 'Left', type: ElementType.paragraph }, multiZonePost.document._id);
    await admin.addElement({ zone: 'right', html: 'Right', type: ElementType.paragraph }, multiZonePost.document._id);

    // Publish the posts so we can see them in preview
    let patchResp = await admin.patchPost({ _id: publicPost._id, public: true });
    assert.ok(patchResp);
    patchResp = await admin.patchPost({ _id: multiZonePost._id, public: true });
    assert.ok(patchResp);
  });

  after(async () => {
    await admin.removePost(publicPost._id);
    await admin.removePost(multiZonePost._id);
    await admin.removePost(privatePost._id);
  });

  it('does not let regular jump to private post url', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${privatePost._id}`);
    const path = await postPage.page.evaluate(() => window.location.pathname);
    assert.deepEqual(path, `/dashboard/posts`);
  });

  it('does let regular jump to public post url', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    const path = await postPage.page.evaluate(() => window.location.pathname);
    assert.deepEqual(path, `/dashboard/posts/edit/${publicPost._id}`);
  });

  it('does show a post preview to regular users', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    assert.deepEqual(await postPage.isPreview(), true);
  });

  it('does show valid preview details for a post with 1 zone', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual(previewDetails.author, admin.username);
    assert.deepEqual(previewDetails.title, 'Test Public Post');
    assert.deepEqual(previewDetails.zones.length, 0);
    assert.deepEqual(previewDetails.contents[0], "This is a post's <b>content</b>");
  });

  it('does show valid preview details for a post with 2 zones', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${multiZonePost._id}`);
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual(previewDetails.author, admin.username);
    assert.deepEqual(previewDetails.title, 'Test Public Post');
    assert.deepEqual(previewDetails.zones.length, 2);
    assert.deepEqual(previewDetails.contents[0], '<p>Left</p>');
    assert.deepEqual(previewDetails.contents[1], '<p>Right</p>');
  });
});
