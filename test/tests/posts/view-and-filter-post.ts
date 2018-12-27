import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'modepress';
import { PostsController } from '../../../../../src/controllers/posts';
import { UsersController } from '../../../../../src/controllers/users';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let postA: IPost<'client'>;
let postB: IPost<'client'>;
let controller: PostsController;

describe( 'View and filter posts created by backend: ', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const joeUser = await users.getUser( { username: joe.username } );
    const adminUser = await users.getUser( { username: admin.username } );

    postA = await controller.create( {
      title: 'AAAA',
      slug: randomId(),
      public: false,
      author: joeUser._id.toString()
    } );

    postB = await controller.create( {
      title: 'zzzz',
      slug: randomId(),
      public: true,
      author: adminUser._id.toString()
    } );


    await postPage.load( admin );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    const postsOnPage = await postPage.getPosts();
    assert( postsOnPage.length > 0 );
    assert.equal( postsOnPage[ 0 ].name, postB.title );
  } )

  it( 'Posts can filter by title', async () => {
    await postPage.filter( 'Something_I_AM_NOT' );
    let postsOnPage = await postPage.getPosts();
    assert( postsOnPage.length === 0 );

    await postPage.filter( postA.title );
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postA.title );
  } )

  it( 'Can sort by title, creation date, modified date', async () => {
    await postPage.load( admin );
    await postPage.toggleFilterOptionsPanel( true );
    await postPage.selectSortType( 'title' );

    // Check the name sorting (desc to begin with)
    let postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postB.title );

    // Reverse (now asc)
    await postPage.clickSortOrder();
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postA.title );

    // Check the creation date sorting (desc)
    await postPage.selectSortType( 'created' );
    await postPage.clickSortOrder();

    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postB.title );
    assert.equal( postsOnPage[ 1 ].name, postA.title );

    // Check the modified date sorting (desc)
    await postPage.selectSortType( 'modified' );
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postB.title );
    assert.equal( postsOnPage[ 1 ].name, postA.title );
  } )

  it( 'Posts can filter by visibility', async () => {
    await postPage.load( admin );
    await postPage.toggleFilterOptionsPanel( true );

    await postPage.selectVisibility( 'public' );
    let postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postB.title );

    await postPage.selectVisibility( 'private' );
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postA.title );

    await postPage.selectVisibility( 'all' );
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postB.title );
  } )

  it( 'Posts can filter by user', async () => {
    await postPage.load( admin );
    await postPage.toggleFilterOptionsPanel( true );

    await postPage.selectUserFilter( joe.email );
    let postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postA.title );

    await postPage.selectUserFilter( admin.email );
    postsOnPage = await postPage.getPosts();
    assert.equal( postsOnPage[ 0 ].name, postB.title );
  } )

  it( 'Post is private & not visible to regular user in dashboard', async () => {
    await postPage.load( joe );
    const postsOnPage = await postPage.getPosts();
    if ( postsOnPage.length > 0 )
      assert.notEqual( postsOnPage[ 0 ].name, postA.title );
  } )

  after( async () => {
    await controller.removePost( postA._id.toString() );
    await controller.removePost( postB._id.toString() );
  } )
} );