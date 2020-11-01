import CommentsPage from 'mantle/clients/mantle-admin/test/pages/comments';
import * as assert from 'assert';
import utils from 'mantle/clients/mantle-admin/test/utils';
import {} from 'mocha';
import Agent from 'mantle/clients/mantle-admin/test/utils/agent';
import { randomId } from 'mantle/clients/mantle-admin/test/utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost, IComment, IUserEntry } from 'mantle/src/types';

let commentPage = new CommentsPage();
let admin: Agent, joe: Agent;
let post1: IPost<'server'>;
let post2: IPost<'server'>;
let rootComment: IComment<'server'>, otherRootComment: IComment<'server'>;

describe('View comment posts: ', function () {
  let joeUser: IUserEntry<'server'>;
  let adminUser: IUserEntry<'server'>;

  before(async () => {
    const controller = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const comments = ControllerFactory.get('comments');
    const docs = ControllerFactory.get('documents');

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    joeUser = (await users.getUser({ username: joe.username })) as IUserEntry<'server'>;
    adminUser = (await users.getUser({ username: admin.username })) as IUserEntry<'server'>;

    post1 = await controller.create({
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id,
    });

    post2 = await controller.create({
      title: randomId(),
      slug: randomId(),
      public: false,
      author: adminUser._id,
    });

    const post1Doc = await ControllerFactory.get('documents').get({ docId: post1._id });
    const post2Doc = await ControllerFactory.get('documents').get({ docId: post1._id });

    docs.updateElement({ docId: post1.document }, { _id: post1Doc!.elements[0], html: '<p>This is post 1</p>' });
    docs.updateElement({ docId: post2.document }, { _id: post2Doc!.elements[0], html: '<p>This is post 2</p>' });

    rootComment = await comments.create({
      author: joeUser.username as string,
      user: joeUser._id,
      post: post1._id,
      content: randomId(),
    });

    otherRootComment = await comments.create({
      author: joeUser.username as string,
      user: joeUser._id,
      post: post2._id,
      content: randomId(),
    });

    // Publish post
    await controller.update(post1._id, { public: true });
    const resp = await controller.update(post2._id, { public: true });
    resp;
  });

  after(async () => {
    const posts = ControllerFactory.get('posts');
    const comments = ControllerFactory.get('comments');

    await comments.remove(rootComment._id);
    await comments.remove(otherRootComment._id);
    await posts.removePost(post1._id.toString());
  });

  it('can view the post preview', async () => {
    await commentPage.load(admin);
    await commentPage.commentModule.select(1);
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual(details.author, joeUser.username);
    assert.deepEqual(details.contents[0], '<p>This is post 1</p>');
    assert.deepEqual(details.title, post1.title);
  });

  it('can view a different post preview', async () => {
    await commentPage.commentModule.select(0);
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual(details.author, adminUser.username);
    assert.deepEqual(details.contents[0], '<p>This is post 2</p>');
    assert.deepEqual(details.title, post2.title);
  });

  it('can view the first post preview of a reply', async () => {
    await commentPage.commentModule.select(1);
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual(details.title, post1.title);
  });

  it('does let a regular user see a public post', async () => {
    await commentPage.load(joe);
    await commentPage.commentModule.select(1);
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual(details.title, post1.title);
  });
});
