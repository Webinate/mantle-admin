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

describe( 'Testing the Deletion of posts', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    post = await controller.create( {
      title: 'Test Post',
      slug: randomId()
    } )
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    await postPage.load( admin );
    const posts = await postPage.getPosts();
    assert( posts.length > 0 );
    assert.equal( posts[ 0 ].name, 'Test Post' );
  } )

  it( 'Can delete the post from the post list', async () => {
    await postPage.selectPost( post.title );

    // Ensure we have the post selected
    let posts = await postPage.getPosts( true );
    assert.equal( posts[ 0 ].name, post.title );

    // Now delete
    await postPage.deleteSelectedPost();

    // Make sure its not selected
    posts = await postPage.getPosts( true );
    assert( posts.length === 0 );

    // Make sure its there in any form
    posts = await postPage.getPosts();
    assert( !posts.find( p => p.name === post.title ) );
  } )
} );