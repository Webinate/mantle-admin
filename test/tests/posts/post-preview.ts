import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { IPost } from 'mantle';

let postPage = new PostsPage();
let admin: Agent;
let post: IPost<'expanded'>;

describe( 'Testing the view preview button for admins: ', function() {

  before( async () => {
    const controller = ControllerFactory.get( 'posts' );
    const docs = ControllerFactory.get( 'documents' );
    const templateCtrl = ControllerFactory.get( 'templates' );

    const users = ControllerFactory.get( 'users' );
    admin = await utils.refreshAdminToken();

    const adminUser = await users.getUser( { username: admin.username } )!;
    const templatePage = await templateCtrl.getMany();

    post = await controller.create( {
      title: 'Test Post',
      author: adminUser._id,
      slug: randomId(),
      public: false
    } ) as IPost<'expanded'>;


    await docs.changeTemplate( { id: post.document._id }, templatePage.data[ 1 ]._id );
    await docs.addElement( { id: post.document._id },
      { zone: 'left', html: 'Left', type: 'elm-paragraph' } );
    await docs.addElement( { id: post.document._id },
      { zone: 'right', html: 'Right', type: 'elm-paragraph' } );
  } )

  after( async () => {
    const controller = ControllerFactory.get( 'posts' );
    await controller.removePost( post._id.toString() );
  } )

  it( 'does show a post preview to admin users when preview clicked', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    assert.deepEqual( await postPage.isPreview(), false );
    await postPage.gotoPreviewMode( true );
    assert.deepEqual( await postPage.isPreview(), true );
  } )

  it( 'has 2 empty zones as its not ', async () => {
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual( previewDetails.author, admin.username );
    assert.deepEqual( previewDetails.title, 'Test Post' );
    assert.deepEqual( previewDetails.zones.length, 2 );
    assert.deepEqual( previewDetails.contents[ 0 ], '' );
    assert.deepEqual( previewDetails.contents[ 1 ], '' );
  } )

  it( 'does create a draft after we update the post', async () => {
    await postPage.clickBack( true );
    await postPage.clickUpdate();
    await postPage.gotoPreviewMode( true );
  } )

  it( 'does have valid a valid preview', async () => {
    const previewDetails = await postPage.previewDetails();
    assert.deepEqual( previewDetails.author, admin.username );
    assert.deepEqual( previewDetails.title, 'Test Post' );
    assert.deepEqual( previewDetails.zones.length, 2 );
    assert.deepEqual( previewDetails.contents[ 0 ], 'Left' );
    assert.deepEqual( previewDetails.contents[ 1 ], 'Right' );
  } )

  it( 'does go back to editing a post when we click back', async () => {
    assert.deepEqual( await postPage.isPreview(), true );
    await postPage.gotoPreviewMode( false );
    assert.deepEqual( await postPage.isPreview(), false );
    assert.deepEqual( await postPage.title(), 'Test Post' );
  } )
} );