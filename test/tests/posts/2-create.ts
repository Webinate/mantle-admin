import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'modepress';
import { PostsController } from '../../../../../src/controllers/posts';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let post: IPost;
let controller: PostsController;

describe( '2. Testing the creation of posts: ', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    await postPage.load( admin );
  } )

  it( 'does not let regular users click new post', async () => {
    await postPage.load( joe );
    await postPage.waitFor( '.mt-new-post button[disabled]' )
  } )

  it( 'does let admin click new post', async () => {
    await postPage.load( admin );
    await postPage.clickNewPost();
  } )

  it( 'does not allow post creation without title and slug', async () => {
    await postPage.waitFor( '.mt-post-confirm button[disabled]' );
  } )

  after( async () => {
  } )
} );