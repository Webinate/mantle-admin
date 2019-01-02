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
let post: IPost<'expanded'>;
let controller: PostsController;
let newSlug = randomId();

describe( 'Test changing of post template: ', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    const docs = ControllerFactory.get( 'documents' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    post = await controller.create( {
      title: 'Test Post',
      brief: 'Oh my brief',
      tags: [ 'Tag 1', 'Tag 2' ],
      slug: randomId(),
      public: false
    } ) as IPost<'expanded'>;

    await docs.updateElement( { id: post.document._id }, post.document.currentDraft.elements[ 0 ]._id, {
      html: '<p>HELLO WORLD</p>'
    } );
  } )

  after( async () => {
    await controller.removePost( post._id.toString() );
  } )

  it( 'does have only 1 template tab', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    const tabs = await postPage.elementsModule.getTabs();
    assert.equal( tabs[ 0 ], 'Main' );
  } )

  it( 'has the correct element text', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    const elms = await postPage.elementsModule.htmlArray();
    assert.equal( elms[ 0 ], '<p>HELLO WORLD</p>' );
  } )

  it( 'can open the template panel and has 2 options', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    await postPage.openPanel( 'templates' );
    const templates = await postPage.getTemplates();
    assert.equal( templates[ 0 ], 'Simple Post' );
    assert.equal( templates[ 1 ], 'Double Column' );
  } )

  it( 'does not have any change template warnings', async () => {
    const hasWarning = await postPage.getTemplateWarnings();
    assert.deepEqual( hasWarning, false );
  } )

  it( 'does show a warning if you change the title', async () => {
    await postPage.title( 'Test' );
    const hasWarning = await postPage.getTemplateWarnings();
    assert.deepEqual( hasWarning, true );
  } )

  it( 'does hides the warning once you click update', async () => {
    await postPage.clickUpdate();
    await postPage.doneLoading();
    const hasWarning = await postPage.getTemplateWarnings();
    assert.deepEqual( hasWarning, false );
  } )

  it( 'correctly renders the post once the template is changed to double', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    await postPage.openPanel( 'templates' );
    await postPage.selectTemplate( 'Double Column' );

    const tabs = await postPage.elementsModule.getTabs();
    assert.equal( tabs[ 0 ], 'Left' );
    assert.equal( tabs[ 1 ], 'Right' );
    assert.equal( tabs[ 2 ], 'Unassigned' );

    const elms = await postPage.elementsModule.htmlArray();
    assert( elms.length === 0 );
  } )

  it( 'has moved the element to the unassigned column', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    await postPage.elementsModule.clickTab( 'Unassigned' );
    const elms = await postPage.elementsModule.htmlArray();
    assert( elms.length === 1 );
    assert.deepEqual( elms[ 0 ], '<p>HELLO WORLD</p>' );
  } )
} );