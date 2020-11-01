import PostsPage from 'mantle/clients/mantle-admin/test/pages/posts';
import * as assert from 'assert';
import utils from 'mantle/clients/mantle-admin/test/utils';
import {} from 'mocha';
import Agent from 'mantle/clients/mantle-admin/test/utils/agent';
import { randomId } from 'mantle/clients/mantle-admin/test/utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost } from 'mantle/src/types';

let postPage = new PostsPage();
let admin: Agent, joe: Agent, mary: Agent;
let publicPost: IPost<'server'>;
let commentText = randomId();
let replyText = randomId();

describe('Preview posts available to regular users: ', function () {
  before(async () => {
    const controller = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    mary = await utils.createAgent('Mary', 'mary333@test.com', 'password');
    const adminUser = await users.getUser({ username: admin.username });

    publicPost = await controller.create({
      title: 'Test Public Post',
      author: adminUser!._id,
      slug: randomId(),
      public: true,
    });

    await postPage.load(admin);
  });

  after(async () => {
    const controller = ControllerFactory.get('posts');
    await controller.removePost(publicPost._id.toString());
  });

  it('does allow a regular user to comment on a preview', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.addComment(commentText);
    const comments = await postPage.commentsModule.getComments();
    assert(comments.length === 1);
    assert.deepEqual(comments[0].content, commentText);
    assert.deepEqual(comments[0].author, joe.username);
  });

  it('does allow a regular user to reply to a comment on a preview', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.replyComment(0, replyText);
    const comments = await postPage.commentsModule.getComments();
    assert(comments.length === 2);
    assert.deepEqual(comments[1].content, replyText);
    assert.deepEqual(comments[1].author, joe.username);
  });

  it("prevents other user's from editing and deleting comments", async () => {
    await postPage.load(mary, `/dashboard/posts/edit/${publicPost._id}`);
    assert.deepEqual(await postPage.commentsModule.canDelete(0), false);
    assert.deepEqual(await postPage.commentsModule.canEdit(0), false);
  });

  it('admin is shown all edit and delete buttons', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${publicPost._id}`);
    assert.deepEqual(await postPage.commentsModule.canDelete(0), true);
    assert.deepEqual(await postPage.commentsModule.canEdit(0), true);
  });

  it('does allow a user to delete a comment on the preview', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);

    // Delete reply
    await postPage.commentsModule.clickDelete(1);
    await postPage.commentsModule.confirmDelete();

    // Delete original comment
    await postPage.commentsModule.clickDelete(0);
    await postPage.commentsModule.confirmDelete();

    const comments = await postPage.commentsModule.getComments();
    assert(comments.length === 0);
  });

  it('does allow an admin to edit a regular users comment', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.addComment(commentText);

    await postPage.load(admin, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.editComment(0, 'DINOSAURS RULED THE EARTH');

    const comments = await postPage.commentsModule.getComments();
    assert(comments.length === 1);
    assert.deepEqual(comments[0].content, 'DINOSAURS RULED THE EARTH');
    assert.deepEqual(comments[0].author, joe.username);
  });

  it('does allow an admin to delete a regular users comment', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.clickDelete(0);
    await postPage.commentsModule.confirmDelete();
    const comments = await postPage.commentsModule.getComments();
    assert(comments.length === 0);
  });

  it('does allow a user to delete a root comment with other users comments', async () => {
    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.addComment(commentText);

    await postPage.load(mary, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.replyComment(0, 'First reply');

    await postPage.load(admin, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.replyComment(0, 'Second reply');

    let comments = await postPage.commentsModule.getComments();
    assert(comments.length === 3);
    assert.deepEqual(comments[0].content, commentText);
    assert.deepEqual(comments[1].content, 'First reply');
    assert.deepEqual(comments[2].content, 'Second reply');

    await postPage.load(joe, `/dashboard/posts/edit/${publicPost._id}`);
    await postPage.commentsModule.clickDelete(0);
    await postPage.commentsModule.confirmDelete();

    comments = await postPage.commentsModule.getComments();
    assert(comments.length === 0);
  });
});
