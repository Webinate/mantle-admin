import HomePage from '../../pages/home';
import * as assert from 'assert';
import {} from 'mocha';
import { IPost } from 'mantle/src';
import Agent from '../../utils/agent';
import utils from '../../utils';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { randomId } from '../../utils/misc';
import * as format from 'date-fns/format';

let page = new HomePage();
let admin: Agent, joe: Agent;
let publicPost: IPost<'expanded'>, privatePost: IPost<'expanded'>;

describe('Latest Post tests: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    admin = await utils.refreshAdminToken();

    const posts = ControllerFactory.get('posts');
    const templates = ControllerFactory.get('templates');
    const docs = ControllerFactory.get('documents');
    const users = ControllerFactory.get('users');
    const joeUser = await users.getUser({ username: joe.username });
    const adminUser = await users.getUser({ username: admin.username });
    const templatePage = await templates.getMany();

    publicPost = (await posts.create({
      title: randomId(),
      slug: randomId(),
      public: true,
      brief: 'This is the first',
      author: adminUser._id.toString(),
    })) as IPost<'expanded'>;

    privatePost = (await posts.create({
      title: randomId(),
      slug: randomId(),
      public: true,
      brief: 'This is brief',
      author: joeUser._id.toString(),
    })) as IPost<'expanded'>;

    await docs.addElement(
      { id: publicPost.document._id },
      { html: 'This is part of the first', type: 'elm-paragraph' }
    );

    await docs.changeTemplate({ id: privatePost.document._id }, templatePage.data[1]._id);
    await docs.addElement({ id: privatePost.document._id }, { zone: 'left', html: 'Left', type: 'elm-paragraph' });
    await docs.addElement({ id: privatePost.document._id }, { zone: 'right', html: 'Right', type: 'elm-paragraph' });

    // Publish - order important here.
    // We publish the public post second because we want to check that the latest post
    // is based on creation date as opposed to modified
    await posts.update(privatePost._id, { public: false });
    await posts.update(publicPost._id, { public: true });
    await page.load(admin);
  });

  after(async () => {
    const controller = ControllerFactory.get('posts');
    await controller.removePost(privatePost._id.toString());
    await controller.removePost(publicPost._id.toString());
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
    assert.deepEqual(latest.author, privatePost.author ? privatePost.author.username : '');
    assert.deepEqual(latest.created, format(new Date(), 'MMM do, yyyy')); // Make sure its today
    assert.deepEqual(latest.zones.length, 2);
    assert.deepEqual(latest.zones[0].name, 'left');
    assert.deepEqual(latest.zones[0].content, 'Left');
    assert.deepEqual(latest.zones[1].name, 'right');
    assert.deepEqual(latest.zones[1].content, 'Right');
  });

  it('should show the first public post if not an admin', async () => {
    const posts = ControllerFactory.get('posts');
    await page.load(joe);
    assert.deepEqual(await page.hasLatestPost(), true);
    const latest = await page.getLatestPostDetails();
    assert.deepEqual(latest.heading, publicPost.title);
  });

  it('should show the all posts if an admin', async () => {
    const posts = ControllerFactory.get('posts');
    await posts.update(privatePost._id, { public: false });
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
