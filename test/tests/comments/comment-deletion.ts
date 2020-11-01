import CommentsPage from '../../../test/pages/comments';
import * as assert from 'assert';
import utils from '../../../test/utils';
import {} from 'mocha';
import Agent from '../../../test/utils/agent';
import { randomId } from '../../../test/utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost, IComment, IUserEntry } from 'mantle/src/types';

let commentPage = new CommentsPage();
let admin: Agent, joe: Agent;
let post: IPost<'server'>;
let joesComment: IComment<'server'>, joesOtherComment: IComment<'server'>, joesParentComment: IComment<'server'>;

describe('Test the deletion of comments:', function () {
  before(async () => {
    const controller = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const comments = ControllerFactory.get('comments');

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const joeUser = (await users.getUser({ username: joe.username })) as IUserEntry<'server'>;
    const adminUser = (await users.getUser({ username: admin.username })) as IUserEntry<'server'>;

    post = await controller.create({
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id,
    });

    joesComment = await comments.create({
      author: joeUser.username as string,
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });
    joesOtherComment = await comments.create({
      author: joeUser.username as string,
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });
    joesParentComment = await comments.create({
      author: joeUser.username as string,
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });
    await comments.create({
      author: adminUser.username as string,
      user: adminUser._id,
      post: post._id,
      content: randomId(),
      parent: joesParentComment._id,
    });
    await commentPage.load(admin);
  });

  after(async () => {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id.toString());
  });

  it('allows regular users to delete their own comment', async () => {
    await commentPage.load(joe);
    let comments = await commentPage.commentModule.getComments();
    assert.deepEqual(comments[3].content, joesComment.content);
    assert.deepEqual(comments[3].hasDelBtn, true);
    await commentPage.commentModule.clickDelete(3);
    await commentPage.commentModule.confirmDelete();
    comments = await commentPage.commentModule.getComments();
    if (comments.length > 3) assert.notDeepEqual(comments[3].content, joesComment.content);
  });

  it('allows admin users to delete others comments', async () => {
    await commentPage.load(admin);
    let comments = await commentPage.commentModule.getComments();
    assert.deepEqual(comments[2].content, joesOtherComment.content);
    await commentPage.commentModule.clickDelete(2);
    await commentPage.commentModule.confirmDelete();
    comments = await commentPage.commentModule.getComments();
    if (comments.length > 2) assert.notDeepEqual(comments[2].content, joesOtherComment.content);
  });

  it('allows regular user to delete root comment with admin reply', async () => {
    await commentPage.load(joe);
    let comments = await commentPage.commentModule.getComments();
    assert.deepEqual(comments[0].content, joesParentComment.content);
    await commentPage.commentModule.clickDelete(0);
    await commentPage.commentModule.confirmDelete();
    comments = await commentPage.commentModule.getComments();
    if (comments.length > 0) assert.notDeepEqual(comments[0].content, joesParentComment.content);
  });
});
