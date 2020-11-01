import HomePage from '../../pages/home';
import * as assert from 'assert';
import {} from 'mocha';
import { IPost, IUserEntry } from 'mantle/src/types';
import Agent from '../../utils/agent';
import utils from '../../utils';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { randomId } from '../../utils/misc';
import { format } from 'date-fns';

let page = new HomePage();
let admin: Agent, joe: Agent;
let publicPost: IPost<'server'>, privatePost: IPost<'server'>;

describe('Recent Posts: ', function () {
  let joeUser: IUserEntry<'server'>;
  let adminUser: IUserEntry<'server'>;

  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    admin = await utils.refreshAdminToken();

    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    joeUser = (await users.getUser({ username: joe.username })) as IUserEntry<'server'>;
    adminUser = (await users.getUser({ username: admin.username })) as IUserEntry<'server'>;

    publicPost = await posts.create({
      title: randomId(),
      slug: randomId(),
      public: true,
      brief: 'This is the first',
      author: adminUser._id,
    });

    privatePost = await posts.create({
      title: randomId(),
      slug: randomId(),
      public: false,
      brief: 'This is brief',
      author: joeUser._id,
    });

    // Update so we can check its sorting by modified
    await posts.update(publicPost._id, { public: true });
  });

  after(async () => {
    const controller = ControllerFactory.get('posts');
    await controller.removePost(privatePost._id.toString());
    await controller.removePost(publicPost._id.toString());
  });

  it('it should have both public & private posts for admin', async () => {
    await page.load(admin);
    const recent = await page.getRecentPosts();
    assert.deepEqual(recent[0].author, adminUser.username);
    assert.deepEqual(recent[0].created, format(new Date(), 'MMM do, yyyy')); // Today
    assert.deepEqual(recent[0].heading, publicPost.title);
    assert.deepEqual(recent[1].heading, privatePost.title);
  });

  it('it should have only public posts for joe', async () => {
    // Update so we can check its sorting by modified
    const posts = ControllerFactory.get('posts');
    await posts.update(privatePost._id, { public: false });
    await page.load(joe);

    const recent = await page.getRecentPosts();
    assert.deepEqual(recent[0].author, adminUser.username);
    assert.deepEqual(recent[0].created, format(new Date(), 'MMM do, yyyy')); // Today
    assert.deepEqual(recent[0].heading, publicPost.title);
    if (recent.length > 1) assert.notDeepEqual(recent[1].heading, privatePost.title);
  });
});
