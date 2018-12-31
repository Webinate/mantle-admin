import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { IVolume } from 'modepress';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { randomId } from '../../utils/misc';
import { uploadFileToVolume } from '../../utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volume: IVolume<'expanded'>;
const randomName = randomId();
const randomFileName = randomId();

describe( 'Testing the renaming of files: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const userEntry = await users.getUser( { username: joe.username } );

    volume = await volumes.create( { name: randomName, user: userEntry._id.toString() } ) as IVolume<'expanded'>;
    await uploadFileToVolume( 'img-a.png', volume, 'File A' );
  } )

  it( 'can select and rename a single file', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.mediaModule.selectFile( 'File A' );
    await page.mediaModule.clickRenameFile();
    await page.mediaModule.newName( randomFileName );
    await page.mediaModule.confirmModal();

    const files = await page.mediaModule.getFiles();
    assert.deepEqual( files[ 0 ].name, randomFileName );
  } )

  it( 'allows an admin to rename a different users file', async () => {
    await page.load( admin, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.mediaModule.selectFile( randomFileName );
    await page.mediaModule.clickRenameFile();
    await page.mediaModule.newName( 'File A' );
    await page.mediaModule.confirmModal();

    let files = await page.mediaModule.getFiles();
    assert.deepEqual( files[ 0 ].name, 'File A' );

    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();

    files = await page.mediaModule.getFiles();
    assert.deepEqual( files[ 0 ].name, 'File A' );
  } )
} );