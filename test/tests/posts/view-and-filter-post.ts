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
let posts: IPost<'client'>[] = [];
let controller: PostsController;
let postNames = [ 'aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh', 'iii',
  'jjj', 'kkk', 'lll', 'mmm' ];

describe( 'View and filter posts created by backend', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    for ( let postName of postNames ) {
      posts.push( await controller.create( {
        title: postName,
        slug: randomId(),
        public: false,
        content: 'This is a post\'s content'
      } ) );
    }

    await postPage.load( admin );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    const postsOnPage = await postPage.getPosts();
    assert( postsOnPage.length > 0 );
    assert.equal( postsOnPage[ 0 ].name, posts[ posts.length - 1 ].title );
    assert.equal( postsOnPage[ 0 ].image, '/images/avatar-1.svg' );
    assert.equal( postsOnPage[ 0 ].featuredImage, '/images/post-feature.svg' );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    await postPage.filter( 'Something_I_AM_NOT' );
    let postsOnPage = await postPage.getPosts();
    assert( postsOnPage.length === 0 );

    await postPage.filter( postNames[ 0 ] );
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, posts[ 0 ].title );
  } )

  it( 'Post is private & not visible to regular user in dashboard', async () => {
    await postPage.load( joe );
    const postsOnPage = await postPage.getPosts();
    if ( postsOnPage.length > 0 )
      assert.notEqual( postsOnPage[ 0 ].name, posts[ posts.length - 1 ].title );
  } )

  after( async () => {
    for ( const post of posts ) {
      await controller.removePost( post._id.toString() );
    }
  } )
} );