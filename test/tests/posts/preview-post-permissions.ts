import PostsPage from 'modepress/clients/modepress-admin/test/pages/posts';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { randomId } from 'modepress/clients/modepress-admin/test/utils/misc';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { IPost } from 'modepress';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let publicPost: IPost<'client'>,
  privatePost: IPost<'client'>;

describe( 'Preview posts available to regular users: ', function() {

  before( async () => {
    const controller = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    const adminUser = await users.getUser( { username: admin.username } );

    publicPost = await controller.create( {
      title: 'Test Public Post',
      author: adminUser!._id,
      slug: randomId(),
      public: true,
      content: 'This is a post\'s <b>content</b>'
    } );

    privatePost = await controller.create( {
      title: 'Test Private Post',
      author: adminUser!._id,
      slug: randomId(),
      public: false,
      content: 'This is a post\'s <b>content</b>'
    } );

    await postPage.load( admin );
  } )

  after( async () => {
    const controller = ControllerFactory.get( 'posts' );
    await controller.removePost( publicPost._id.toString() );
    await controller.removePost( privatePost._id.toString() );
  } )

  it( 'does not let regular jump to private post url', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ privatePost._id }` );
    const path = await postPage.page.evaluate( () => window.location.pathname );
    assert.deepEqual( path, `/dashboard/posts` );
  } )

  it( 'does let regular jump to public post url', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ publicPost._id }` );
    const path = await postPage.page.evaluate( () => window.location.pathname );
    assert.deepEqual( path, `/dashboard/posts/edit/${ publicPost._id }` );
  } )

  it( 'does show a post preview to regular users', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ publicPost._id }` );
    assert.deepEqual( await postPage.isPreview(), true );
  } )

  it( 'does show valid preview details', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ publicPost._id }` );
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual( previewDetails.author, admin.username );
    assert.deepEqual( previewDetails.title, 'Test Public Post' );
    assert.deepEqual( previewDetails.content, 'This is a post\'s <b>content</b>' );
  } )
} );