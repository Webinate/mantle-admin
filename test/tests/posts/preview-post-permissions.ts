import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost } from 'mantle/src/types';
import { ElementType } from '../../../../../src/core/enums';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let publicPost: IPost<'server'>, multiZonePost: IPost<'server'>, privatePost: IPost<'server'>;

describe('Preview posts available to regular users: ', function () {
  before(async () => {
    const controller = ControllerFactory.get('posts');
    const docs = ControllerFactory.get('documents');
    const templateCtrl = ControllerFactory.get('templates');

    const users = ControllerFactory.get('users');
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const adminUser = await users.getUser({ username: admin.username });
    const templatePage = await templateCtrl.getMany();

    publicPost = await controller.create({
      title: 'Test Public Post',
      author: adminUser!._id,
      slug: randomId(),
      public: true,
    });

    multiZonePost = await controller.create({
      title: 'Test Public Post',
      author: adminUser!._id,
      slug: randomId(),
      public: true,
    });

    privatePost = await controller.create({
      title: 'Test Private Post',
      author: adminUser!._id,
      slug: randomId(),
      public: false,
    });

    const publicPostDocElements = await docs.getElements(publicPost.document);

    // Add an element to the public post#
    await docs.updateElement(
      { docId: publicPost.document },
      {
        _id: publicPostDocElements[0]._id,
        html: "This is a post's <b>content</b>",
      }
    );
    await docs.changeTemplate({ docId: multiZonePost.document }, templatePage.data[1]._id);
    await docs.addElement(
      { docId: multiZonePost.document },
      { zone: 'left', html: 'Left', type: ElementType.paragraph }
    );
    await docs.addElement(
      { docId: multiZonePost.document },
      { zone: 'right', html: 'Right', type: ElementType.paragraph }
    );

    // Publish the posts so we can see them in preview
    await controller.update(publicPost._id, { public: true });
    await controller.update(multiZonePost._id, { public: true });
  });

  after(async () => {
    const controller = ControllerFactory.get('posts');
    await controller.removePost(publicPost._id.toString());
    await controller.removePost(multiZonePost._id.toString());
    await controller.removePost(privatePost._id.toString());
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
    assert.deepEqual(previewDetails.contents[0], 'Left');
    assert.deepEqual(previewDetails.contents[1], 'Right');
  });
});
