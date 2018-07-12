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

describe( 'View & edit post created by backend: ', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    post = await controller.create( {
      title: 'Test Post',
      brief: 'Oh my brief',
      tags: [ 'Tag 1', 'Tag 2' ],
      slug: randomId(),
      public: false,
      content: 'This is a post\'s content'
    } )

    await postPage.load( admin );
  } )

  it( 'does not let regular users go to the edit post page directly', async () => {
    await postPage.load( joe, `/dashboard/posts/edit/${ post._id }` );
    await postPage.waitFor( 'button[disabled].mt-new-post' )
  } )

  it( 'does let admin users go to the edit post page directly', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    await postPage.waitFor( '#mt-post-title' );
  } )

  it( 'does get the current post data', async () => {
    assert.deepEqual( await postPage.title(), 'Test Post' );
    assert.deepEqual( await postPage.brief(), 'Oh my brief' );
    assert( await postPage.hasTag( 'Tag 1' ) );
    assert( await postPage.hasTag( 'Tag 2' ) );
    assert.deepEqual( await postPage.getSlug(), post.slug );
    assert.deepEqual( await postPage.isPublic(), false );
    assert.deepEqual( await postPage.user(), 'Not set ' );
  } )

  it( 'can update post details', async () => {
    await postPage.title( 'Test Post EDITED' );
    await postPage.brief( 'Oh my brief EDITED' );
    await postPage.removeTag( 'Tag 1' );
    await postPage.addTag( 'Tag 3' );
    await postPage.setSlug( newSlug );
    await postPage.isPublic( true );
    await postPage.user( 'joe222@test.com' );

    await postPage.clickUpdate();
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );

    assert.deepEqual( await postPage.title(), 'Test Post EDITED' );
    assert.deepEqual( await postPage.brief(), 'Oh my brief EDITED' );
    assert( !( await postPage.hasTag( 'Tag 1' ) ) );
    assert( await postPage.hasTag( 'Tag 3' ) );
    assert.deepEqual( await postPage.getSlug(), newSlug );
    assert.deepEqual( await postPage.isPublic(), true );
    assert.deepEqual( await postPage.user(), 'Joe' );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    await postPage.load( admin, `/dashboard/posts` );
    const posts = await postPage.getPosts();
    assert( posts.length > 0 );
    assert.equal( posts[ 0 ].name, 'Test Post EDITED' );
  } )

  after( async () => {
    if ( post )
      await controller.removePost( post._id.toString() );
  } )
} );