import CommentsPage from 'mantle/clients/mantle-admin/test/pages/comments';
import * as assert from 'assert';
import utils from 'mantle/clients/mantle-admin/test/utils';
import {} from 'mocha';
import Agent from 'mantle/clients/mantle-admin/test/utils/agent';
import { randomId } from 'mantle/clients/mantle-admin/test/utils/misc';
import { Post, Comment, User } from 'mantle';
import AdminAgent from '../../utils/admin-agent';

let commentPage = new CommentsPage();
let admin: AdminAgent, joe: Agent;
let post1: Post;
let post2: Post;
let rootComment: Comment, otherRootComment: Comment;

describe('View comment posts: ', function () {
  let joeUser: User;
  let adminUser: User;

  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    joeUser = await admin.getUser(joe.username);
    adminUser = await admin.getUser(admin.username);

    post1 = await admin.addPost({
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id,
    });

    post2 = await admin.addPost({
      title: randomId(),
      slug: randomId(),
      public: false,
      author: adminUser._id,
    });

    admin.updateElement({ _id: post1.document.elements![0]._id, html: '<p>This is post 1</p>' }, post1.document._id);
    admin.updateElement({ _id: post2.document.elements![0]._id, html: '<p>This is post 2</p>' }, post2.document._id);

    rootComment = await admin.addComment({
      user: joeUser._id,
      post: post1._id,
      content: randomId(),
    });

    otherRootComment = await admin.addComment({
      user: joeUser._id,
      post: post2._id,
      content: randomId(),
    });

    // Publish post
    await admin.patchPost({ _id: post1._id, public: true });
    const resp = await admin.patchPost({ _id: post2._id, public: true });
    resp;
  });

  after(async () => {
    await admin.removeComment(rootComment._id);
    await admin.removeComment(otherRootComment._id);
    await admin.removePost(post1._id);
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
