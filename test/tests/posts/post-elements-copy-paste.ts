import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost, IVolume } from 'modepress';
import { PostsController } from '../../../../../src/controllers/posts';
import { uploadFileToVolume } from '../../utils/file';

let postPage = new PostsPage();
let admin: Agent;
let post: IPost<'expanded'>;
let volume: IVolume<'expanded'>;

describe( 'Testing the copy/paste of image elements: ', function() {

  before( async () => {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );
    const docs = ControllerFactory.get( 'documents' );
    const volumes = ControllerFactory.get( 'volumes' );
    const files = ControllerFactory.get( 'files' );

    admin = await utils.refreshAdminToken();
    post = await posts.create( {
      title: 'Image test',
      slug: randomId(),
      public: false
    } ) as IPost<'expanded'>;



    const userEntry = await users.getUser( { username: admin.username } );
    volume = await volumes.create( { name: randomId(), user: userEntry._id.toString() } ) as IVolume<'expanded'>;

    await uploadFileToVolume( 'img-a.png', volume, 'File A' );
    const uploads = await files.getFiles( { volumeId: volume._id } );

    await docs.updateElement( { id: post.document._id }, post.document.currentDraft.elements[ 0 ]._id, { html: '<p>THIS IS A TEST</p>' } );
    await docs.addElement( { id: post.document._id }, { type: 'elm-header-1', html: '<h1>HEADER 1</h1>', zone: 'main' } );
    await docs.addElement( { id: post.document._id }, { type: 'elm-header-2', html: '<h1>HEADER 2</h1>', zone: 'main' } );
    await docs.addElement( { id: post.document._id }, { type: 'elm-header-3', html: '<h1>HEADER 3</h1>', zone: 'main' } );
    await docs.addElement( { id: post.document._id }, { type: 'elm-image', html: `<figure><img src="${ uploads.data[ 0 ].publicURL }" /></figure>`, zone: 'main' } );
  } )

  after( async () => {
    const volumes = ControllerFactory.get( 'volumes' );
    const posts = ControllerFactory.get( 'posts' );
    await volumes.remove( { _id: volume._id } );
    await posts.removePost( post._id.toString() );
  } )

  it( 'does have a set of elements to copy from', async () => {
    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    const elements = await postPage.elementsModule.htmlArray();
    assert.deepEqual( elements.length, 5 );
  } )
} );