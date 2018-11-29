import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'modepress';
import { PostsController } from '../../../../../src/controllers/posts';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let post: IPost<'client'>;
let controller: PostsController;
let newSlug = randomId();

describe( 'Testing the creation of elements: ', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    post = await controller.create( {
      title: 'Test Post',
      brief: 'Oh my brief',
      slug: randomId(),
      public: false
    } )

    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
  } )

  after( async () => {
    if ( post )
      await controller.removePost( post._id.toString() );
  } )

  it( 'does have one element already present', async () => {
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 1 );
  } )

  it( 'does create edit the first paragraph and creates a new one on enter', async () => {
    await postPage.elementsModule.activateAt( 0 );
    await postPage.elementsModule.typeAndPress( 'Paragraph 1' );
    await postPage.elementsModule.waitForActivation( 1 );

    // Create a new paragraph and hit escape
    await postPage.elementsModule.typeAndPress( 'Paragraph 2', 'Escape' );

    // Hitting escape should remove focus
    await postPage.elementsModule.waitForNoFocus();
    assert.deepEqual( await postPage.elementsModule.elmHasFocus(), false );

    // Should have 3 paragraphs
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 2 );
    assert.deepEqual( elements[ 0 ], '<p>Paragraph 1</p>' );
    assert.deepEqual( elements[ 1 ], '<p>Paragraph 2</p>' );
  } )

  it( 'does create a new paragraph on enter after a selected element index', async () => {
    await postPage.elementsModule.activateAt( 0 );
    await postPage.page.keyboard.press( 'Enter' );
    await postPage.elementsModule.waitForActivation( 1 );
    await postPage.elementsModule.typeAndPress( 'Paragraph 1 - a', 'Escape' );
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 3 );
    assert.deepEqual( elements[ 0 ], '<p>Paragraph 1</p>' );
    assert.deepEqual( elements[ 1 ], '<p>Paragraph 1 - a</p>' );
    assert.deepEqual( elements[ 2 ], '<p>Paragraph 2</p>' );
  } )

  it( 'does create a new paragraph after a selection when we click on the p button', async () => {
    await postPage.elementsModule.activateAt( 1 );
    await postPage.elementsModule.clickNewParagraph();
    await postPage.elementsModule.waitForActivation( 2 );
    await postPage.elementsModule.typeAndPress( 'Paragraph 1 - b', 'Escape' );
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 4 );
    assert.deepEqual( elements[ 0 ], '<p>Paragraph 1</p>' );
    assert.deepEqual( elements[ 1 ], '<p>Paragraph 1 - a</p>' );
    assert.deepEqual( elements[ 2 ], '<p>Paragraph 1 - b</p>' );
    assert.deepEqual( elements[ 3 ], '<p>Paragraph 2</p>' );
  } )

  it( 'does not create a new paragraph when we press enter in a ul list', async () => {
    await postPage.elementsModule.clickNewList( 'ul' );
    await postPage.elementsModule.waitForActivation( 4 );
    await postPage.elementsModule.typeAndPress( 'First item' );
    await postPage.elementsModule.typeAndPress( 'Second item', 'Escape' );
    await postPage.elementsModule.doneLoading();
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 5 );
    assert.deepEqual( elements[ 0 ], '<p>Paragraph 1</p>' );
    assert.deepEqual( elements[ 1 ], '<p>Paragraph 1 - a</p>' );
    assert.deepEqual( elements[ 2 ], '<p>Paragraph 1 - b</p>' );
    assert.deepEqual( elements[ 3 ], '<p>Paragraph 2</p>' );
    assert.deepEqual( elements[ 4 ], '<ul><li>First item</li><li>Second item</li></ul>' );
  } )

  it( 'does not create a new paragraph when we press enter in a ol list', async () => {
    await postPage.elementsModule.clickNewList( 'ol' );
    await postPage.elementsModule.waitForActivation( 5 );
    await postPage.elementsModule.typeAndPress( 'First item' );
    await postPage.elementsModule.typeAndPress( 'Second item', 'Escape' );
    await postPage.elementsModule.doneLoading();
    await postPage.elementsModule.waitForNoFocus();

    // Check order
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 6 );
    assert.deepEqual( elements[ 0 ], '<p>Paragraph 1</p>' );
    assert.deepEqual( elements[ 1 ], '<p>Paragraph 1 - a</p>' );
    assert.deepEqual( elements[ 2 ], '<p>Paragraph 1 - b</p>' );
    assert.deepEqual( elements[ 3 ], '<p>Paragraph 2</p>' );
    assert.deepEqual( elements[ 4 ], '<ul><li>First item</li><li>Second item</li></ul>' );
    assert.deepEqual( elements[ 5 ], '<ol><li>First item</li><li>Second item</li></ol>' );
  } )
} );