import MediaPage from '../../../test/pages/media';
import * as assert from 'assert';
import utils from '../../../test/utils';
import { } from 'mocha';
import Agent from '../../../test/utils/agent';
import { IVolume } from 'modepress';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { uploadFileToVolume } from '../../../test/utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent, mary: Agent;
let volume: IVolume<'expanded'>;

describe( 'Testing the fetching of files & permissions: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    mary = await utils.createAgent( 'Mary', 'mary333@test.com', 'password' );
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const userEntry = await users.getUser( { username: joe.username } );

    volume = await volumes.create( { name: 'test', user: userEntry!._id.toString() } ) as IVolume<'expanded'>;

    await uploadFileToVolume( 'img-a.png', volume, 'File A' );
    await uploadFileToVolume( 'img-b.png', volume, 'File B' );
    await uploadFileToVolume( 'img-c.png', volume, 'File C' );
  } )

  after( async () => {
    const volumes = ControllerFactory.get( 'volumes' );
    await volumes.remove( { _id: volume._id } );
  } )


  it( 'does show 3 files for the user who uploaded then', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    const files = await page.mediaModule.getFiles();
    assert.deepEqual( files.length, 3 );
  } )

  it( 'prevents non-admin users from seeing another users volume', async () => {
    await page.load( mary, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    const files = await page.mediaModule.getFiles();
    const message = await page.appModule.getSnackMessage();
    assert.deepEqual( files.length, 0 );
    assert.deepEqual( message, 'You do not have permission' );
  } )

  it( 'does allow an admin to see a users volume', async () => {
    await page.load( admin, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    const files = await page.mediaModule.getFiles();
    assert.deepEqual( files.length, 3 );
  } )
} );