import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost, IVolume } from 'modepress';
import { PostsController } from '../../../../../src/controllers/posts';

let postPage = new PostsPage();
let admin: Agent;
let post: IPost<'client'>;
let volume: IVolume<'client'>;

describe( 'Testing the creation of image elements: ', function() {

  before( async () => {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );

    admin = await utils.refreshAdminToken();
    post = await posts.create( {
      title: 'Image test',
      slug: randomId(),
      public: false
    } )

    const userEntry = await users.getUser( { username: admin.username } );
    volume = await volumes.create( { name: randomId(), user: userEntry._id.toString() } );

    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
  } )

  after( async () => {
    const volumes = ControllerFactory.get( 'volumes' );
    const posts = ControllerFactory.get( 'posts' );
    await volumes.remove( { _id: volume._id } );
    await posts.removePost( post._id.toString() );
  } )

  it( 'does create a valid image element', async () => {
    await postPage.clickAddImg()
    await postPage.mediaModule.doneLoading();

    await postPage.mediaModule.selectVolume( volume.name );
    await postPage.mediaModule.openVolume();

    await postPage.mediaModule.uploadFile( 'img-a.png' );
    await postPage.mediaModule.selectFile( 'img-a.png' );

    await postPage.mediaModule.confirmModal();

    await postPage.elementsModule.waitForSelected( 1 );
    const elements = await postPage.elementsModule.htmlArray();

    const files = ControllerFactory.get( 'files' );
    const filesPage = await files.getFiles( { volumeId: volume._id } )

    assert.deepEqual( elements[ 1 ], `<figure><img src="${ filesPage.data[ 0 ].publicURL }"></figure>` );
  } )

  it( 'can replace an image and its updated in the elements', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );

    await postPage.clickAddImg()
    await postPage.mediaModule.doneLoading();

    await postPage.mediaModule.selectVolume( volume.name );
    await postPage.mediaModule.openVolume();
    await postPage.mediaModule.selectFile( 'img-a.png' );
    await postPage.mediaModule.replaceFile( 'img-b.png' );
    await postPage.mediaModule.selectFile( 'img-b.png' );
    await postPage.mediaModule.cancelModal();

    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    const elements = await postPage.elementsModule.htmlArray();

    const files = ControllerFactory.get( 'files' );
    const filesPage = await files.getFiles( { volumeId: volume._id } );
    assert.deepEqual( elements[ 1 ], `<figure><img src="${ filesPage.data[ 0 ].publicURL }"></figure>` );
    assert( filesPage.data[ 0 ].publicURL.endsWith( 'img-b.png' ) );
  } )
} );