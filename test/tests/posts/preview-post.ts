import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'modepress';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let publicPost: IPost<'client'>,
  privatePost: IPost<'client'>;
let commentText = randomId();
let replyText = randomId();

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

  it( 'does allow a user to comment on a preview', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ publicPost._id }` );
    await postPage.commentsModule.addComment( commentText );
    const comments = await postPage.commentsModule.getComments();
    assert( comments.length === 1 );
    assert.deepEqual( comments[ 0 ].content, commentText );
    assert.deepEqual( comments[ 0 ].author, joe.username );
  } )

  it( 'does allow a user to reply to a comment on a preview', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ publicPost._id }` );
    await postPage.commentsModule.replyComment( 0, replyText );
    const comments = await postPage.commentsModule.getComments();
    assert( comments.length === 2 );
    assert.deepEqual( comments[ 1 ].content, replyText );
    assert.deepEqual( comments[ 1 ].author, joe.username );
  } )

  it( 'does allow a user to delete a comment a preview', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ publicPost._id }` );

    // Delete reply
    await postPage.commentsModule.clickDelete( 1 );
    await postPage.commentsModule.confirmDelete();

    // Delete original comment
    await postPage.commentsModule.clickDelete( 0 );
    await postPage.commentsModule.confirmDelete();

    const comments = await postPage.commentsModule.getComments();
    assert( comments.length === 0 );
  } )
} );