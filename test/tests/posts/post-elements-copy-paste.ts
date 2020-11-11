import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import AdminAgent from '../../utils/admin-agent';
import { randomId } from '../../utils/misc';
import { uploadFileToVolume } from '../../utils/file';
import { Post, Volume } from 'mantle';
import { ElementType } from '../../../../../src/core/enums';

let postPage = new PostsPage();
let admin: AdminAgent;
let post: Post;
let post2: Post;
let volume: Volume;

describe('Testing the copy/paste of image elements: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    post = await admin.addPost({
      title: 'Image test',
      slug: randomId(),
      public: false,
    });

    post2 = await admin.addPost({
      title: 'Image test 2',
      slug: randomId(),
      public: false,
    });

    const userEntry = await admin.getUser(admin.username);
    volume = await admin.addVolume({ name: randomId(), user: userEntry!._id });

    const resp = await uploadFileToVolume('img-a.png', volume, 'File A', admin);
    assert.deepEqual(resp.status, 200);

    const uploads = await admin.getFiles({ volumeId: volume._id });

    const fetchedPost = await admin.getPost({ id: post._id });

    await admin.updateElement(
      {
        _id: fetchedPost.document.elements![0]._id,
        html: '<p>THIS IS A TEST</p>',
      },
      post.document._id
    );
    await admin.addElement({ type: ElementType.header1, html: '<h1>HEADER 1</h1>', zone: 'main' }, post.document._id);
    await admin.addElement({ type: ElementType.header2, html: '<h1>HEADER 2</h1>', zone: 'main' }, post.document._id);
    await admin.addElement({ type: ElementType.header3, html: '<h1>HEADER 3</h1>', zone: 'main' }, post.document._id);
    await admin.addElement(
      { type: ElementType.image, html: `<figure><img src="${uploads.data[0].publicURL}" /></figure>`, zone: 'main' },
      post.document._id
    );
  });

  after(async () => {
    await admin.removeVolume(volume._id);
    await admin.removePost(post._id);
    await admin.removePost(post2._id);
  });

  it('does have a set of elements to copy from', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 5);
  });

  it('can select, copy to clipboard and delete the current selection', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    await postPage.elementsModule.selectRange(0, 4);
    const numSelected = await postPage.elementsModule.numSelectedElms();
    assert.deepEqual(numSelected, 5);

    await postPage.keyboardCopy();

    await postPage.elementsModule.clickDelete();
    await postPage.elementsModule.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 0);
  });

  it('can paste the units from clipboard', async () => {
    await postPage.keyboardPaste();
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 5);
  });

  it('does removes the units when cutting', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
    await postPage.elementsModule.selectRange(0, 4);
    await postPage.keyboardCut();
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 0);
  });

  it('can paste units after a reload', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);

    let elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 0);

    await postPage.focusOnEditor();
    await postPage.keyboardPaste();
    await postPage.doneLoading();

    elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 5);
  });

  it('can paste units into another tab', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);

    let elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 5);

    await postPage.elementsModule.clickTab('Unassigned');

    elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 0);

    await postPage.focusOnEditor();
    await postPage.keyboardPaste();
    await postPage.doneLoading();

    elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 5);
  });

  it('do not allow pasting units unless editor or element is focussed', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post2._id}`);
    let elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 1);

    await postPage.keyboardPaste();
    await postPage.doneLoading();

    elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 1);
  });

  it('can paste units into a different post', async () => {
    await postPage.load(admin, `/dashboard/posts/edit/${post2._id}`);
    let elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 1);

    await postPage.elementsModule.clickAt(0);
    await postPage.keyboardPaste();
    await postPage.doneLoading();

    elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 6);
  });
});
