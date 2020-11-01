import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost, IVolume } from 'mantle/src/types';
import { uploadFileToVolume } from '../../utils/file';
import { ElementType } from '../../../../../src/core/enums';

let postPage = new PostsPage();
let admin: Agent;
let post: IPost<'server'>;
let post2: IPost<'server'>;
let volume: IVolume<'server'>;

describe('Testing the copy/paste of image elements: ', function () {
  before(async () => {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const docs = ControllerFactory.get('documents');
    const volumes = ControllerFactory.get('volumes');
    const files = ControllerFactory.get('files');

    admin = await utils.refreshAdminToken();
    post = await posts.create({
      title: 'Image test',
      slug: randomId(),
      public: false,
    });

    post2 = await posts.create({
      title: 'Image test 2',
      slug: randomId(),
      public: false,
    });

    const userEntry = await users.getUser({ username: admin.username });
    volume = await volumes.create({ name: randomId(), user: userEntry!._id });

    await uploadFileToVolume('img-a.png', volume, 'File A');
    const uploads = await files.getFiles({ volumeId: volume._id });

    const postDocElements = await docs.getElements(post.document);

    await docs.updateElement(
      { docId: post.document },
      {
        _id: postDocElements[0]._id,
        html: '<p>THIS IS A TEST</p>',
      }
    );
    await docs.addElement(
      { docId: post.document },
      { type: ElementType.header1, html: '<h1>HEADER 1</h1>', zone: 'main' }
    );
    await docs.addElement(
      { docId: post.document },
      { type: ElementType.header2, html: '<h1>HEADER 2</h1>', zone: 'main' }
    );
    await docs.addElement(
      { docId: post.document },
      { type: ElementType.header3, html: '<h1>HEADER 3</h1>', zone: 'main' }
    );
    await docs.addElement(
      { docId: post.document },
      { type: ElementType.image, html: `<figure><img src="${uploads.data[0].publicURL}" /></figure>`, zone: 'main' }
    );
  });

  after(async () => {
    const volumes = ControllerFactory.get('volumes');
    const posts = ControllerFactory.get('posts');
    await volumes.remove({ _id: volume._id });
    await posts.removePost(post._id.toString());
    await posts.removePost(post2._id.toString());
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
