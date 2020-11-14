import HomePage from '../../pages/home';
import * as assert from 'assert';
import {} from 'mocha';
import { Post, User } from 'mantle';
import Agent from '../../utils/agent';
import utils from '../../utils';
import { randomId } from '../../utils/misc';
import { format } from 'date-fns';
import AdminAgent from '../../utils/admin-agent';
import { ElementType } from '../../../../../src/core/enums';

let page = new HomePage();
let admin: AdminAgent, joe: Agent;
let publicPost: Post, privatePost: Post;

describe('Latest Post tests: ', function () {
  let joeUser: User;

  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    admin = await utils.refreshAdminToken();

    joeUser = await admin.getUser(joe.username);
    const adminUser = await admin.getUser(admin.username);
    const templatePage = await admin.getTemplates();

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
      public: true,
      brief: 'This is brief',
      author: joeUser._id,
    });

    await admin.addElement({ html: 'This is part of the first', type: ElementType.paragraph }, publicPost.document._id);
    await admin.changeTemplate(templatePage.data[1]._id, privatePost.document._id);
    await admin.addElement({ zone: 'left', html: 'Left', type: ElementType.paragraph }, privatePost.document._id);
    await admin.addElement({ zone: 'right', html: 'Right', type: ElementType.paragraph }, privatePost.document._id);

    // Publish - order important here.
    // We publish the public post second because we want to check that the latest post
    // is based on creation date as opposed to modified
    await admin.patchPost({ _id: privatePost._id, public: false });
    await admin.patchPost({ _id: publicPost._id, public: true });
    await page.load(admin);
  });

  after(async () => {
    await admin.removePost(privatePost._id);
    await admin.removePost(publicPost._id);
  });

  it('it should have a latest post', async () => {
    assert.deepEqual(await page.hasLatestPost(), true);
  });

  it('it can toggle latest post content', async () => {
    assert.deepEqual(await page.isLatestPostExpanded(), false);
    await page.toggleLatestPostContent();
    assert.deepEqual(await page.isLatestPostExpanded(), true);
  });

  it('it should have a latest post data', async () => {
    assert.deepEqual(await page.hasLatestPost(), true);

    const latest = await page.getLatestPostDetails();

    assert.deepEqual(latest.heading, privatePost.title);
    assert.deepEqual(latest.author, privatePost.author ? joeUser.username : '');
    assert.deepEqual(latest.created, format(new Date(), 'MMM do, yyyy')); // Make sure its today
    assert.deepEqual(latest.zones.length, 2);
    assert.deepEqual(latest.zones[0].name, 'left');
    assert.deepEqual(latest.zones[0].content, 'Left');
    assert.deepEqual(latest.zones[1].name, 'right');
    assert.deepEqual(latest.zones[1].content, 'Right');
  });

  it('should show the first public post if not an admin', async () => {
    await page.load(joe);
    assert.deepEqual(await page.hasLatestPost(), true);
    const latest = await page.getLatestPostDetails();
    assert.deepEqual(latest.heading, publicPost.title);
  });

  it('should show the all posts if an admin', async () => {
    await admin.patchPost({ _id: privatePost._id, public: false });
    await page.load(admin);
    const latest = await page.getLatestPostDetails();
    assert.deepEqual(latest.heading, privatePost.title);
  });

  it('should go to the edit page if we click on edit latest', async () => {
    await page.load(admin);
    await page.clickEditLatest();
    assert.deepEqual(await page.pathname(), `/dashboard/posts/edit/${privatePost._id}`);
  });
});
