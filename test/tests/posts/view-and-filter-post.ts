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

describe( 'View and filter posts created by backend', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    post = await controller.create( {
      title: randomId(),
      slug: randomId(),
      public: false,
      content: 'This is a post\'s content'
    } )

    await postPage.load( admin );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    const posts = await postPage.getPosts();
    assert( posts.length > 0 );
    assert.equal( posts[ 0 ].name, post.title );
    assert.equal( posts[ 0 ].image, '/images/avatar-1.svg' );
    assert.equal( posts[ 0 ].featuredImage, '/images/post-feature.svg' );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    await postPage.filter( 'Something_I_AM_NOT' );
    let posts = await postPage.getPosts();
    assert( posts.length === 0 );

    await postPage.filter( post.title );
    posts = await postPage.getPosts();
    assert.equal( posts[ 0 ].name, post.title );
  } )

  it( 'Post is private & not visible to regular user in dashboard', async () => {
    await postPage.load( joe );
    const posts = await postPage.getPosts();
    if ( posts.length > 0 )
      assert.notEqual( posts[ 0 ].name, post.title );
  } )

  after( async () => {
    if ( post )
      await controller.removePost( post._id.toString() );
  } )
} );