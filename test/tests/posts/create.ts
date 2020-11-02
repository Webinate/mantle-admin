import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import { Volume, Post } from 'mantle';
import AdminAgent from '../../utils/admin-agent';

let postPage = new PostsPage();
let admin: AdminAgent, joe: Agent;
let postSlug = randomId();
let volume: Volume;
let createdPost: Post;

describe('Testing the creation of posts: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    const userEntry = await admin.getUser(admin.username);
    volume = await admin.addVolume({ name: randomId(), user: userEntry!._id });

    await postPage.load(admin);
  });

  after(async () => {
    await admin.removeVolume(volume._id);
    await admin.removePost(createdPost._id);
  });

  it('does not let regular users click new post', async () => {
    await postPage.load(joe);
    await postPage.waitFor('button[disabled].mt-new-post ');
  });

  it('does let admin click new post', async () => {
    await postPage.load(admin);
    await postPage.clickNewPost();

    // Now check that post was created
    const path = await postPage.pathname();
    const id = path.split('/').pop();
    createdPost = await admin.getPost({ id });
    assert(createdPost);
  });

  it('does have two templates', async () => {
    await postPage.addTag('tag 1');
    await postPage.addTag('tag 2');
  });

  it('does not allow post creation with empty title and slug', async () => {
    await postPage.title('');
    await postPage.waitFor('button[disabled].mt-post-confirm');
  });

  it('did autofill a slug with only accepted characters', async () => {
    await postPage.title(' !£$Test&*( )  ');
    assert.equal(await postPage.getSlug(), '-test--');

    await postPage.title('test');
    assert.equal(await postPage.getSlug(), 'test');
  });

  it('has enabled the confirm button after post & title are filled', async () => {
    assert.deepEqual(await postPage.$('button[disabled].mt-post-confirm'), null);
  });

  it('did allow the author to set a custom slug', async () => {
    await postPage.setSlug('^&custom slug$%');
    assert.equal(await postPage.getSlug(), 'custom-slug');

    await postPage.setSlug('custom_slug');
    assert.equal(await postPage.getSlug(), 'customslug');

    await postPage.setSlug('custom slug');
    assert.equal(await postPage.getSlug(), 'custom-slug');

    await postPage.title('test');
    assert.equal(await postPage.getSlug(), 'custom-slug');
  });

  it('did add and remove tags', async () => {
    await postPage.openPanel('tags');
    await postPage.addTag('tag 1');
    await postPage.addTag('tag 2');
    assert.equal(await postPage.hasTag('tag 1'), true);
    assert.equal(await postPage.hasTag('tag 2'), true);

    await postPage.removeTag('tag 1');
    await postPage.removeTag('tag 2');
    assert.equal(await postPage.hasTag('tag 1'), false);
    assert.equal(await postPage.hasTag('tag 2'), false);
  });

  it('did edit content in the tiny editor', async () => {
    await postPage.updateElmContent(0, 'Simple content babes');
    assert.equal(await postPage.elementsModule.htmlAt(0), '<p>Simple content babes</p>');
  });

  it('did select a featured image', async () => {
    await postPage.openPanel('featured');

    // Clear featured img button should be disabled
    assert.deepEqual(await postPage.$('#mt-remove-featured'), null);

    // Check for default image
    let featuredImg = await postPage.getFeaturedImg();
    assert(featuredImg.endsWith('post-feature.svg'));

    await postPage.clickFeaturedImg();

    // Check there is 1 volume and go into it
    const volumes = await postPage.mediaModule.getVolumes();
    assert.deepEqual(volumes[0].name, volume.name);

    await postPage.mediaModule.selectVolume(volume.name);
    await postPage.mediaModule.openVolume();

    // Make sure there are no files
    let files = await postPage.mediaModule.getFiles();
    assert.deepEqual(files.length, 0);

    // Upload an image file
    await postPage.mediaModule.uploadFile('img-a.png');

    files = await postPage.mediaModule.getFiles();
    assert.deepEqual(files.length, 1);
    assert.deepEqual(files[0].name, 'img-a.png');

    await postPage.mediaModule.selectFile('img-a.png');
    await postPage.mediaModule.confirmModal();

    // Check for updated image
    featuredImg = await postPage.getFeaturedImg();
    assert(featuredImg.endsWith('img-a.png'));

    // Remove img is back
    assert(await postPage.$('#mt-remove-featured'));
  });

  it('has created a post with valid data', async () => {
    await postPage.title(postSlug);
    await postPage.setSlug(postSlug);
    await postPage.addTag('Test Dino');
    await postPage.updateElmContent(0, 'This is a post bruv');
    await postPage.clickConfirm();
    await postPage.clickBack();
    await postPage.doneLoading();

    const posts = await postPage.getPosts();
    assert.equal(posts[0].name, postSlug);

    // Confirm the post is saved as it was created
    const post = await admin.getPost({ slug: postSlug });
    assert.equal(post.document.elements![0].html, '<p>This is a post bruv</p>');
    assert.equal(post.title, postSlug);
    assert.equal(post.slug, postSlug);
    assert(post.tags.includes('Test Dino'));
  });
});
