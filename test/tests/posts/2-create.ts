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

  it( 'does not let regular users go to the new post page directly', async () => {
    await postPage.load( joe, '/dashboard/posts/new' );
    await postPage.waitFor( '.mt-new-post button[disabled]' )
  } )

  it( 'does let admin click new post', async () => {
    await postPage.load( admin );
    await postPage.clickNewPost();
  } )

  it( 'does not allow post creation without title and slug', async () => {
    await postPage.waitFor( '.mt-post-confirm button[disabled]' );
  } )

  it( 'did autofill a slug with only accepted characters', async () => {
    await postPage.title( ' !£$Test&*( )  ' );
    assert.equal( await postPage.getSlug(), '-test--' );

    await postPage.title( 'test' );
    assert.equal( await postPage.getSlug(), 'test' );
  } )

  it( 'has enabled the confirm button after post & title are filled', async () => {
    assert.deepEqual( await postPage.$( '.mt-post-confirm button[disabled]' ), null );
  } )

  it( 'did allow the author to set a custom slug', async () => {
    await postPage.setSlug( '^&custom slug$%' );
    assert.equal( await postPage.getSlug(), 'custom-slug' );

    await postPage.setSlug( 'custom_slug' );
    assert.equal( await postPage.getSlug(), 'customslug' );

    await postPage.setSlug( 'custom slug' );
    assert.equal( await postPage.getSlug(), 'custom-slug' );

    await postPage.title( 'test' );
    assert.equal( await postPage.getSlug(), 'custom-slug' );
  } )

  after( async () => {
  } )
} );