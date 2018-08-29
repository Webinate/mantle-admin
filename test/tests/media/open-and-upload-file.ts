import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { IVolume } from 'modepress';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { randomId } from 'modepress/clients/modepress-admin/test/utils/misc';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volume: IVolume<'client'>;
const randomName = randomId();

describe( 'Testing the uploading of a file: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    const users = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const userEntry = await users.getUser( joe.username );

    volume = await volumes.create( { name: randomName, user: userEntry.dbEntry._id.toString() } );
  } )

  it( 'does open a volume & the url is correct', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.selectVolume( randomName );
    await page.openVolume();

    const path = await page.page.evaluate( () => window.location.pathname );
    assert.deepEqual( path, `/dashboard/media/volume/${ volume._id }` );
  } )

  it( 'does open a volume & the url is correct', async () => {
    await page.load( joe, `/dashboard/media/volume/${ volume._id }` );
    await page.doneLoading();
    await page.uploadFile( 'img-a.png' );

    const files = await page.getFiles();
    assert.deepEqual( files.length, 1 );
  } )
} );