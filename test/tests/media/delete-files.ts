import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { IVolume } from 'modepress';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { randomId } from 'modepress/clients/modepress-admin/test/utils/misc';
import { uploadFileToVolume } from 'modepress/clients/modepress-admin/test/utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volume: IVolume<'client'>;
const randomName = randomId();

describe( 'Testing the deletion of files: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const userEntry = await users.getUser( { username: joe.username } );

    volume = await volumes.create( { name: randomName, user: userEntry._id } );

    await uploadFileToVolume( 'img-a.png', volume, 'File A' );
    await uploadFileToVolume( 'img-b.png', volume, 'File B' );
    await uploadFileToVolume( 'img-c.png', volume, 'File C' );
    await uploadFileToVolume( 'img-c.png', volume, 'File D' );
  } )

  it( 'can select and delete a single file', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.selectFile( 'File A' );
    await page.clickDeleteFiles()
    await page.confirmModal();

    const files = await page.getFiles();
    assert.deepEqual( files.length, 3 );
    assert.deepEqual( files.find( f => f.name === 'File A' ), undefined );
  } )

  it( 'allows admin to delete a file', async () => {
    await page.load( admin, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.selectFile( 'File B' );
    await page.clickDeleteFiles()
    await page.confirmModal();

    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();

    const files = await page.getFiles();
    assert.deepEqual( files.length, 2 );
    assert.deepEqual( files.find( f => f.name === 'File B' ), undefined );
  } )

  it( 'can delete multiple files at once', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.selectAll();
    await page.clickDeleteFiles()
    await page.confirmModal();

    const files = await page.getFiles();
    assert.deepEqual( files.length, 0 );
  } )
} );