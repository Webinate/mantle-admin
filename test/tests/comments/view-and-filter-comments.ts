import CommentsPage from '../../pages/comments';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import { Post, Comment } from 'mantle';
import AdminAgent from '../../utils/admin-agent';

let commentPage = new CommentsPage();
let admin: AdminAgent, joe: Agent;
let post: Post;
let comment1: Comment, comment2: Comment;

describe('View and filter comments created by backend: ', function () {
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

    // Update the first so that its the most edited one
    await admin.patchComment({ _id: comment1._id, content: comment1.content });

    await commentPage.load(admin);
  });

  after(async () => {
    await admin.removeComment(comment1._id);
    await admin.removeComment(comment2._id);
    await admin.removePost(post._id);
  });

  it('shows the last edited comment is first', async () => {
    await commentPage.doneLoading();
    const comments = await commentPage.commentModule.getComments();
    assert.equal(comments[0].content, comment1.content);
    assert.equal(comments[1].content, comment2.content);
  });

  it('sorts by creation date', async () => {
    await commentPage.toggleFilterOptionsPanel(true);
    await commentPage.selectSortType('created');
    await commentPage.doneLoading();
    const comments = await commentPage.commentModule.getComments();
    assert.equal(comments[0].content, comment2.content);
    assert.equal(comments[1].content, comment1.content);
  });

  it('sorts by comment user', async () => {
    await commentPage.load(admin);
    await commentPage.toggleFilterOptionsPanel(true);
    await commentPage.selectUserFilter(joe.email);

    let comments = await commentPage.commentModule.getComments();
    assert.equal(comments[0].author, joe.username);

    await commentPage.selectUserFilter(admin.email);
    comments = await commentPage.commentModule.getComments();
    assert.equal(comments[0].author, admin.username);
  });
});
