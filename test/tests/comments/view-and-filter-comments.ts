import CommentsPage from '../../pages/comments';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost, IComment } from 'modepress';

let commentPage = new CommentsPage();
let admin: Agent, joe: Agent;
let post: IPost<'expanded'>;;
let comment1: IComment<'expanded'>, comment2: IComment<'expanded'>;

describe( 'View and filter comments created by backend: ', function() {

  before( async () => {
    const controller = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    const comments = ControllerFactory.get( 'comments' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const joeUser = await users.getUser( { username: joe.username } );
    const adminUser = await users.getUser( { username: admin.username } );

    post = await controller.create( {
      title: randomId(),
      slug: randomId(),
      public: true,
      author: joeUser._id.toString()
    } ) as IPost<'expanded'>;

    comment1 = await comments.create( { author: joeUser.username, user: joeUser._id, post: post._id, content: randomId() } ) as IComment<'expanded'>;
    comment2 = await comments.create( { author: adminUser.username, user: adminUser._id, post: post._id, content: randomId() } ) as IComment<'expanded'>;

    // Update the first so that its the most edited one
    await comments.update( comment1._id.toString(), { content: comment1.content } );

    await commentPage.load( admin );
  } )

  after( async () => {
    const posts = ControllerFactory.get( 'posts' );
    const comments = ControllerFactory.get( 'comments' );

    await comments.remove( comment1._id );
    await comments.remove( comment2._id );
    await posts.removePost( post._id.toString() );
  } )

  it( 'shows the last edited comment is first', async () => {
    await commentPage.doneLoading();
    const comments = await commentPage.commentModule.getComments();
    assert.equal( comments[ 0 ].content, comment1.content );
    assert.equal( comments[ 1 ].content, comment2.content );
  } )

  it( 'sorts by creation date', async () => {
    await commentPage.toggleFilterOptionsPanel( true );
    await commentPage.selectSortType( 'created' );
    await commentPage.doneLoading();
    const comments = await commentPage.commentModule.getComments();
    assert.equal( comments[ 0 ].content, comment2.content );
    assert.equal( comments[ 1 ].content, comment1.content );
  } )

  it( 'sorts by comment user', async () => {
    await commentPage.load( admin );
    await commentPage.toggleFilterOptionsPanel( true );
    await commentPage.selectUserFilter( joe.email );

    let comments = await commentPage.commentModule.getComments();
    assert.equal( comments[ 0 ].author, joe.username );

    await commentPage.selectUserFilter( admin.email );
    comments = await commentPage.commentModule.getComments();
    assert.equal( comments[ 0 ].author, admin.username );
  } )
} );