import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import AdminAgent from '../../utils/admin-agent';
import { randomId } from '../../utils/misc';
import { Post } from 'mantle';

let postPage = new PostsPage();
let admin: AdminAgent;
let post: Post;

describe('Test changing of post template: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    await utils.createAgent('Joe', 'joe222@test.com', 'password');

    post = await admin.addPost({
      title: 'Test Post',
      brief: 'Oh my brief',
      tags: ['Tag 1', 'Tag 2'],
      slug: randomId(),
      public: false,
    });

    const fetchedPost = await admin.getPost({ id: post._id });

    await admin.updateElement(
      {
        _id: fetchedPost.document!.elements![0]._id,
        html: '<p>HELLO WORLD</p>',
      },
      post.document._id
    );
  });

  after(async () => {
    await admin.removePost(post._id);
  });

  it('does have only 1 template tab', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    const tabs = await postPage.elementsModule.getTabs();
    assert.equal(tabs[0], 'Main');
  });

  it('has the correct element text', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    const elms = await postPage.elementsModule.htmlArray();
    assert.equal(elms[0], '<p>HELLO WORLD</p>');
  });

  it('can open the template panel and has 2 options', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    await postPage.openPanel('templates');
    const templates = await postPage.getTemplates();
    assert.equal(templates[0], 'Simple Post');
    assert.equal(templates[1], 'Double Column');
  });

  it('does not have any change template warnings', async () => {
    const hasWarning = await postPage.getTemplateWarnings();
    assert.deepEqual(hasWarning, false);
  });

  it('does show a warning if you change the title', async () => {
    await postPage.title('Test');
    const hasWarning = await postPage.getTemplateWarnings();
    assert.deepEqual(hasWarning, true);
  });

  it('does hides the warning once you click update', async () => {
    await postPage.clickUpdate();
    await postPage.doneLoading();
    const hasWarning = await postPage.getTemplateWarnings();
    assert.deepEqual(hasWarning, false);
  });

  it('correctly renders the post once the template is changed to double', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    await postPage.openPanel('templates');
    await postPage.selectTemplate('Double Column');

    const tabs = await postPage.elementsModule.getTabs();
    assert.equal(tabs[0], 'Left');
    assert.equal(tabs[1], 'Right');
    assert.equal(tabs[2], 'Unassigned');

    const elms = await postPage.elementsModule.htmlArray();
    assert(elms.length === 0);
  });

  it('has moved the element to the unassigned column', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    await postPage.elementsModule.clickTab('Unassigned');
    const elms = await postPage.elementsModule.htmlArray();
    assert(elms.length === 1);
    assert.deepEqual(elms[0], '<p>HELLO WORLD</p>');
  });
});
