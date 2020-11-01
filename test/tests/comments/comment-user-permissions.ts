import CommentsPage from '../../../test/pages/comments';
import * as assert from 'assert';
import utils from '../../../test/utils';
import {} from 'mocha';
import Agent from '../../../test/utils/agent';
import { randomId } from '../../../test/utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost, IComment, IUserEntry } from 'mantle/src/types';

let commentPage = new CommentsPage();
let admin: Agent, joe: Agent, mary: Agent;
let post: IPost<'server'>;
let comment1: IComment<'server'>, comment2: IComment<'server'>;

describe('Show / Hide comment edit & delete buttons based on user: ', function () {
  before(async () => {
    const controller = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const comments = ControllerFactory.get('comments');

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    mary = await utils.createAgent('Mary', 'mary333@test.com', 'password');

    const joeUser = (await users.getUser({ username: joe.username })) as IUserEntry<'server'>;
    const adminUser = (await users.getUser({ username: admin.username })) as IUserEntry<'server'>;

    post = await controller.create({
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id,
    });

    comment1 = await comments.create({
      author: joeUser.username as string,
      user: joeUser._id,
      post: post._id,
      content: randomId(),
    });

    comment2 = await comments.create({
      author: adminUser.username as string,
      user: adminUser._id,
      post: post._id,
      content: randomId(),
    });
    await commentPage.load(admin);
  });

  after(async () => {
    const posts = ControllerFactory.get('posts');
    const comments = ControllerFactory.get('comments');

    await comments.remove(comment1._id);
    await comments.remove(comment2._id);
    await posts.removePost(post._id.toString());
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
