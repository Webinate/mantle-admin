import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';

import ControllerFactory from '../../../../../lib/core/controller-factory';
import { IPost } from 'modepress';
import { PostsController } from '../../../../../lib/controllers/posts';

let posts = new PostsPage();
let admin: Agent;
let post: IPost;
let controller: PostsController;

describe( '1. Show new post as first item in posts page', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    controller = ControllerFactory.get( 'posts' );
    await posts.load( admin );
    assert( await posts.$( '.mt-posts' ) );
  } )

  it( 'Removed any existing post with the slug test-post', async () => {
    try {
      post = await controller.getPost( { slug: 'test-post' } );
      if ( post )
        await controller.removePost( post._id.toString() );
    }
    catch { }
  } )

  it( 'Created a new post with the slug test-post', async () => {
    post = await controller.create( {
      title: 'New Post',
      author: 'Joe Duffy',
      slug: 'test-post',
      public: false,
      content: 'This is a post\'s content'
    } )
  } )

  after( async () => {
    if ( post )
      await controller.removePost( post._id.toString() );
  } )
} );