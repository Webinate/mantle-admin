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
let singlePost: IPost<'expanded'>, multiPost1: IPost<'expanded'>, multiPost2: IPost<'expanded'>;
let controller: PostsController;

describe( 'Testing the Deletion of posts: ', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    multiPost1 = await controller.create( {
      title: randomId(),
      slug: randomId()
    } ) as IPost<'expanded'>;

    multiPost2 = await controller.create( {
      title: randomId(),
      slug: randomId()
    } ) as IPost<'expanded'>;

    singlePost = await controller.create( {
      title: randomId(),
      slug: randomId()
    } ) as IPost<'expanded'>;
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    await postPage.load( admin );
    const posts = await postPage.getPosts();
    assert( posts.length > 0 );
    assert.equal( posts[ 0 ].name, singlePost.title );
  } )

  it( 'Can delete the post from the post list', async () => {
    await postPage.selectPost( singlePost.title );

    // Ensure we have the post selected
    let posts = await postPage.getPosts( true );
    assert.equal( posts[ 0 ].name, singlePost.title );

    // Now delete
    await postPage.deleteSelectedPost();

    // Make sure its not selected
    posts = await postPage.getPosts( true );
    assert( posts.length === 0 );

    // Make sure its there in any form
    posts = await postPage.getPosts();
    assert( !posts.find( p => p.name === singlePost.title ) );
  } )

  it( 'Can delete multiple posts', async () => {
    await postPage.selectPost( multiPost2.title );
    await postPage.selectPost( multiPost1.title, true );

    // Ensure we have the post selected
    let posts = await postPage.getPosts( true );
    assert.equal( posts[ 0 ].name, multiPost2.title );
    assert.equal( posts[ 1 ].name, multiPost1.title );

    // Now delete
    await postPage.deleteMultiplePosts();

    // Make sure its not selected
    posts = await postPage.getPosts( true );
    assert( posts.length === 0 );

    // Make sure its there in any form
    posts = await postPage.getPosts();
    assert( !posts.find( p => p.name === multiPost1.title ) );
    assert( !posts.find( p => p.name === multiPost2.title ) );
  } )
} );