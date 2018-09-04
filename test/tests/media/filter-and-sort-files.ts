import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { IVolume } from 'modepress';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { uploadFileToVolume } from '../../utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volume: IVolume<'client'>;

describe( 'Testing the sorting and filtering of files: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const userEntry = await users.getUser( { username: joe.username } );

    volume = await volumes.create( { name: 'test', user: userEntry.toString() } );

    await uploadFileToVolume( 'img-a.png', volume, 'File A' );
    await uploadFileToVolume( 'img-b.png', volume, 'File B' );
    await uploadFileToVolume( 'img-c.png', volume, 'File C' );
  } )

  it( 'does have three files uploaded & sorted by upload date', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();

    const files = await page.getFiles();
    assert.deepEqual( files.length, 3 );
    assert.deepEqual( files[ 0 ].name, 'File C' );
    assert.deepEqual( files[ 2 ].name, 'File A' );
  } )

  it( 'does filter based on name', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.clickFileFilter( 'name' );

    let files = await page.getFiles();
    assert.deepEqual( files[ 0 ].name, 'File C' );
    assert.deepEqual( files[ 1 ].name, 'File B' );
    assert.deepEqual( files[ 2 ].name, 'File A' );

    await page.clickFileFilter( 'name' );
    files = await page.getFiles();

    assert.deepEqual( files[ 0 ].name, 'File A' );
    assert.deepEqual( files[ 1 ].name, 'File B' );
    assert.deepEqual( files[ 2 ].name, 'File C' );
  } )

  it( 'does filter based on memory', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.clickFileFilter( 'memory' );

    let files = await page.getFiles();
    assert.deepEqual( files[ 0 ].name, 'File C' );
    assert.deepEqual( files[ 1 ].name, 'File B' );
    assert.deepEqual( files[ 2 ].name, 'File A' );

    await page.clickFileFilter( 'memory' );
    files = await page.getFiles();

    assert.deepEqual( files[ 0 ].name, 'File A' );
    assert.deepEqual( files[ 1 ].name, 'File B' );
    assert.deepEqual( files[ 2 ].name, 'File C' );
  } )

  it( 'does filter based on upload date', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.clickFileFilter( 'created' );

    let files = await page.getFiles();
    assert.deepEqual( files[ 0 ].name, 'File A' );
    assert.deepEqual( files[ 1 ].name, 'File B' );
    assert.deepEqual( files[ 2 ].name, 'File C' );

    await page.clickFileFilter( 'created' );
    files = await page.getFiles();

    assert.deepEqual( files[ 0 ].name, 'File C' );
    assert.deepEqual( files[ 1 ].name, 'File B' );
    assert.deepEqual( files[ 2 ].name, 'File A' );
  } )
} );