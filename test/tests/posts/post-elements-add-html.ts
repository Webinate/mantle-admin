import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'mantle/src/types';
import { PostsController } from '../../../../../src/controllers/posts';

let postPage = new PostsPage();
let admin: Agent;
let post: IPost<'server'>;
let controller: PostsController;

describe('Testing the creation of generic html elements: ', function () {
  before(async () => {
    controller = ControllerFactory.get('posts');
    admin = await utils.refreshAdminToken();

    post = await controller.create({
      title: 'generic test',
      slug: randomId(),
      public: false,
    });

    await postPage.load(admin, `/dashboard/posts/edit/${post._id}`);
  });

  after(async () => {
    await controller.removePost(post._id.toString());
  });

  it('does create and show the html editor when the html button is clicked', async () => {
    await postPage.elementsModule.clickAddHtml();
    await postPage.elementsModule.waitForHtmlEditor(1);
    await postPage.elementsModule.htmlEditorIsActive();
    const curHtml = await postPage.elementsModule.htmlEditorText();
    assert.deepEqual(curHtml, '<div></div>');

    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 2);
    assert.deepEqual(elements[1], '<div></div>');
  });

  it('can set iframe element in generic html element', async () => {
    const html = '<iframe width="300" height="200" src="https://google.com"></iframe>';
    await postPage.elementsModule.activateAt(1, false);
    await postPage.elementsModule.waitForHtmlEditor(1);
    await postPage.elementsModule.htmlEditorIsActive();
    await postPage.elementsModule.htmlEditorText(html);

    await postPage.page.keyboard.press('Escape');
    await postPage.doneLoading();

    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual(elements.length, 2);
    assert.deepEqual(elements[1], html);
  });
});
