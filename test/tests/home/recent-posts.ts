import HomePage from '../../pages/home';
import * as assert from 'assert';
import {} from 'mocha';
import { Post, User } from 'mantle';
import Agent from '../../utils/agent';
import utils from '../../utils';
import { randomId } from '../../utils/misc';
import { format } from 'date-fns';
import AdminAgent from '../../utils/admin-agent';

let page = new HomePage();
let admin: AdminAgent, joe: Agent;
let publicPost: Post, privatePost: Post;

describe('Recent Posts: ', function () {
  let joeUser: User;
  let adminUser: User;

  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    joeUser = await admin.getUser(joe.username);
    adminUser = await admin.getUser(admin.username);

    publicPost = await admin.addPost({
      title: randomId(),
      slug: randomId(),
      public: true,
      brief: 'This is the first',
      author: adminUser._id,
    });

    privatePost = await admin.addPost({
      title: randomId(),
      slug: randomId(),
      public: false,
      brief: 'This is brief',
      author: joeUser._id,
    });

    // Update so we can check its sorting by modified
    await admin.patchPost({ _id: publicPost._id, public: true });
  });

  after(async () => {
    await admin.removePost(privatePost._id);
    await admin.removePost(publicPost._id);
  });

  it('it should have both public & private posts for admin', async () => {
    await page.load(admin);
    const recent = await page.getRecentPosts();
    assert.deepEqual(recent[0].author, joe.username);
    assert.deepEqual(recent[0].created, format(new Date(), 'MMM do, yyyy')); // Today
    assert.deepEqual(recent[0].heading, privatePost.title);
    assert.deepEqual(recent[1].heading, publicPost.title);
    assert.deepEqual(recent[1].author, admin.username);
  });

  it('it should have only public posts for joe', async () => {
    // Update so we can check its sorting by modified
    await admin.patchPost({ _id: privatePost._id, public: false });
    await page.load(joe);

    const recent = await page.getRecentPosts();
    assert.deepEqual(recent[0].author, adminUser.username);
    assert.deepEqual(recent[0].created, format(new Date(), 'MMM do, yyyy')); // Today
    assert.deepEqual(recent[0].heading, publicPost.title);
    if (recent.length > 1) assert.notDeepEqual(recent[1].heading, privatePost.title);
  });
});
