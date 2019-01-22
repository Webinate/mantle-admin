import CommentsPage from 'mantle/clients/mantle-admin/test/pages/comments';
import * as assert from 'assert';
import utils from 'mantle/clients/mantle-admin/test/utils';
import { } from 'mocha';
import Agent from 'mantle/clients/mantle-admin/test/utils/agent';
import { randomId } from 'mantle/clients/mantle-admin/test/utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost, IComment, IUserEntry } from 'mantle';

let commentPage = new CommentsPage();
let admin: Agent, joe: Agent;
let post1: IPost<'expanded'>;
let post2: IPost<'expanded'>;
let rootComment: IComment<'expanded'>,
  otherRootComment: IComment<'expanded'>;

describe( 'View comment posts: ', function() {

  before( async () => {
    const controller = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    const comments = ControllerFactory.get( 'comments' );
    const docs = ControllerFactory.get( 'documents' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const joeUser = await users.getUser( { username: joe.username } );
    const adminUser = await users.getUser( { username: admin.username } );

    post1 = await controller.create( {
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id.toString()
    } ) as IPost<'expanded'>;

    post2 = await controller.create( {
      title: randomId(),
      slug: randomId(),
      public: false,
      author: adminUser._id.toString()
    } ) as IPost<'expanded'>;

    docs.updateElement( { id: post1.document._id }, post1.document.elements[ 0 ]._id, { html: '<p>This is post 1</p>' } );
    docs.updateElement( { id: post2.document._id }, post2.document.elements[ 0 ]._id, { html: '<p>This is post 2</p>' } );

    rootComment = await comments.create( { author: joeUser.username, user: joeUser._id, post: post1._id, content: randomId() } ) as IComment<'expanded'>;
    otherRootComment = await comments.create( { author: joeUser.username, user: joeUser._id, post: post2._id, content: randomId() } ) as IComment<'expanded'>;

    // Publish post
    await controller.update( post1._id, { public: true } );
    await controller.update( post2._id, { public: true } );
  } )

  after( async () => {
    const posts = ControllerFactory.get( 'posts' );
    const comments = ControllerFactory.get( 'comments' );

    await comments.remove( rootComment._id );
    await comments.remove( otherRootComment._id );
    await posts.removePost( post1._id.toString() );
  } )

  it( 'can view the post preview', async () => {
    await commentPage.load( admin );
    await commentPage.commentModule.select( 1 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.author, post1.author.username );
    assert.deepEqual( details.contents[ 0 ], '<p>This is post 1</p>' );
    assert.deepEqual( details.title, post1.title );
  } )

  it( 'can view a different post preview', async () => {
    await commentPage.commentModule.select( 0 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.author, post2.author.username );
    assert.deepEqual( details.contents[ 0 ], '<p>This is post 2</p>' );
    assert.deepEqual( details.title, post2.title );
  } )

  it( 'can view the first post preview of a reply', async () => {
    await commentPage.commentModule.select( 1 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.title, post1.title );
  } )

  it( 'does let a regular user see a public post', async () => {
    await commentPage.load( joe );
    await commentPage.commentModule.select( 1 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.title, post1.title );
  } )
} );