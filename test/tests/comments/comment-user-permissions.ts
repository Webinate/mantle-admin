import CommentsPage from '../../../test/pages/comments';
import * as assert from 'assert';
import utils from '../../../test/utils';
import {} from 'mocha';
import Agent from '../../../test/utils/agent';
import { randomId } from '../../../test/utils/misc';
import { Post, Comment } from 'mantle';
import AdminAgent from '../../utils/admin-agent';

let commentPage = new CommentsPage();
let admin: AdminAgent, joe: Agent, mary: Agent;
let post: Post;
let comment1: Comment, comment2: Comment;

describe('Show / Hide comment edit & delete buttons based on user: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    mary = await utils.createAgent('Mary', 'mary333@test.com', 'password');

    const joeUser = await admin.getUser(joe.username);
    const adminUser = await admin.getUser(admin.username);

    post = await admin.addPost({
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id,
    });

    comment1 = await admin.addComment({
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });

    comment2 = await admin.addComment({
      user: adminUser._id,
      post: post._id,
      content: randomId(),
    });
    await commentPage.load(admin);
  });

  after(async () => {
    await admin.removeComment(comment1._id);
    await admin.removeComment(comment2._id);
    await admin.removePost(post._id);
  });

  it('allows an admin to edit & delete all comments', async () => {
    await commentPage.load(admin);
    const comments = await commentPage.commentModule.getComments();
    assert.deepEqual(comments[0].hasDelBtn, true);
    assert.deepEqual(comments[0].hasEditBtn, true);
    assert.deepEqual(comments[1].hasDelBtn, true);
    assert.deepEqual(comments[1].hasEditBtn, true);
  });

  it('does not allow a regular user to edit other comments', async () => {
    await commentPage.load(joe);
    const comments = await commentPage.commentModule.getComments();
    assert.deepEqual(comments[0].hasDelBtn, false);
    assert.deepEqual(comments[0].hasEditBtn, false);
    assert.deepEqual(comments[1].hasDelBtn, true);
    assert.deepEqual(comments[1].hasEditBtn, true);
  });

  it('does not allow unassociated users any edit buttons', async () => {
    await commentPage.load(mary);
    const comments = await commentPage.commentModule.getComments();
    assert.deepEqual(comments[0].hasDelBtn, false);
    assert.deepEqual(comments[0].hasEditBtn, false);
    assert.deepEqual(comments[1].hasDelBtn, false);
    assert.deepEqual(comments[1].hasEditBtn, false);
  });
});
