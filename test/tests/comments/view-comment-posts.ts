import CommentsPage from 'modepress/clients/modepress-admin/test/pages/comments';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { randomId } from 'modepress/clients/modepress-admin/test/utils/misc';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { IPost, IComment, IUserEntry } from 'modepress';

let commentPage = new CommentsPage();
let admin: Agent, joe: Agent;
let post1: IPost<'client'>;
let post2: IPost<'client'>;
let rootComment: IComment<'client'>,
  rootReply: IComment<'client'>,
  otherRootComment: IComment<'client'>;

describe( 'View comment posts: ', function() {

  before( async () => {
    const controller = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    const comments = ControllerFactory.get( 'comments' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const joeUser = await users.getUser( { username: joe.username } );
    const adminUser = await users.getUser( { username: admin.username } );

    post1 = await controller.create( {
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id.toString()
    } );

    post2 = await controller.create( {
      title: randomId(),
      slug: randomId(),
      public: false,
      author: adminUser._id.toString()
    } );

    rootComment = await comments.create( { author: joeUser.username, user: joeUser._id, post: post1._id, content: randomId() } );
    rootReply = await comments.create( { author: adminUser.username, user: adminUser._id, post: post1._id, parent: rootComment._id, content: randomId() } );
    otherRootComment = await comments.create( { author: joeUser.username, user: joeUser._id, post: post2._id, content: randomId() } );
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
    await commentPage.commentModule.select( 2 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.author, ( post1.author as IUserEntry<'client'> ).username );
    assert.deepEqual( details.content, 'This is post 1' );
    assert.deepEqual( details.title, post1.title );
  } )

  it( 'can view a different post preview', async () => {
    await commentPage.commentModule.select( 0 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.author, ( post2.author as IUserEntry<'client'> ).username );
    assert.deepEqual( details.content, 'This is post 2' );
    assert.deepEqual( details.title, post2.title );
  } )

  it( 'can view the first post preview of a reply', async () => {
    await commentPage.commentModule.select( 1 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.title, post1.title );
  } )

  it( 'does let a regular user see a public post', async () => {
    await commentPage.load( joe );
    await commentPage.commentModule.select( 2 );
    const details = await commentPage.commentModule.previewDetails();
    assert.deepEqual( details.title, post1.title );
  } )
} );