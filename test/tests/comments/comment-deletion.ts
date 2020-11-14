import CommentsPage from '../../../test/pages/comments';
import * as assert from 'assert';
import utils from '../../../test/utils';
import {} from 'mocha';
import Agent from '../../../test/utils/agent';
import { randomId } from '../../../test/utils/misc';
import { Post, Comment } from 'mantle';
import AdminAgent from '../../utils/admin-agent';

let commentPage = new CommentsPage();
let admin: AdminAgent, joe: Agent;
let post: Post;
let joesComment: Comment, joesOtherComment: Comment, joesParentComment: Comment;

describe('Test the deletion of comments:', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const joeUser = await admin.getUser(joe.username);
    const adminUser = await admin.getUser(admin.username);

    post = await admin.addPost({
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id,
    });

    joesComment = await admin.addComment({
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });
    joesOtherComment = await admin.addComment({
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });
    joesParentComment = await admin.addComment({
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });
    await admin.addComment({
      user: adminUser._id,
      post: post._id,
      content: randomId(),
      parent: joesParentComment._id,
    });
    await commentPage.load(admin);
  });

  after(async () => {
    await admin.removePost(post._id);
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
