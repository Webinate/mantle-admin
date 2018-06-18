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
let controller: PostsController;
let postSlug = randomId();

describe( 'Testing the creation of posts: ', function() {

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

  it( 'does let admin users go to the new post page directly', async () => {
    await postPage.load( admin, '/dashboard/posts/new' );
    await postPage.waitFor( '#mt-post-title' );
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

  it( 'did add and remove tags', async () => {
    await postPage.addTag( 'tag 1' );
    await postPage.addTag( 'tag 2' );
    assert.equal( await postPage.hasTag( 'tag 1' ), true );
    assert.equal( await postPage.hasTag( 'tag 2' ), true );

    await postPage.removeTag( 'tag 1' );
    await postPage.removeTag( 'tag 2' );
    assert.equal( await postPage.hasTag( 'tag 1' ), false );
    assert.equal( await postPage.hasTag( 'tag 2' ), false );
  } )

  it( 'did edit content in the tiny editor', async () => {
    await postPage.content( 'Simple content babes' );
    assert.equal( await postPage.content(), 'Simple content babes' );
  } )

  it( 'has created a post with valid data', async () => {
    await postPage.title( postSlug );
    await postPage.setSlug( postSlug );
    await postPage.content( 'This is a post bruv' );
    await postPage.addTag( 'Test Dino' );

    await postPage.clickConfirm();
    assert.equal( await postPage.inEditMode(), false );
    const posts = await postPage.getPosts();
    assert.equal( posts[ 0 ].name, postSlug );

    // Confirm the post is saved as it was created
    const post = await controller.getPost( { slug: postSlug } );
    assert.equal( post.content, '<p>This is a post bruv</p>' );
    assert.equal( post.title, postSlug );
    assert.equal( post.slug, postSlug );
    assert( post.tags.includes( 'Test Dino' ) );
  } )

  after( async () => {
    const post = await controller.getPost( { slug: postSlug } );
    await controller.removePost( post._id.toString() );
  } )
} );