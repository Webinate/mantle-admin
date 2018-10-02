import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import { randomId } from '../../utils/misc';
import Agent from '../../utils/agent';
import ControllerFactory from 'modepress/src/core/controller-factory';

let page = new MediaPage();
let admin: Agent, joe: Agent;
const randomName = randomId();
const newRandomName = randomId();

describe( 'Testing the renaming of a volume: ', function() {

  before( async () => {
    const volumes = ControllerFactory.get( 'volumes' );
    const users = ControllerFactory.get( 'users' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const userEntry = await users.getUser( { username: joe.username } );
    await volumes.create( { name: randomName, user: userEntry._id.toString() } );
  } )

  it( 'does allow a user to rename a volume', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.mediaModule.selectVolume( randomName );
    await page.mediaModule.clickRenameVolume();
    await page.mediaModule.newName( newRandomName );
    await page.mediaModule.confirmModal();

    const volumes = await page.mediaModule.getVolumes();
    assert.deepEqual( volumes[ 0 ].name, newRandomName );
  } )

  it( 'does allow an admin to rename a users volume', async () => {
    await page.load( admin );
    await page.doneLoading();
    await page.mediaModule.selectVolume( newRandomName );
    await page.mediaModule.clickRenameVolume();
    await page.mediaModule.newName( randomName );
    await page.mediaModule.confirmModal();

    await page.load( joe );
    const volumes = await page.mediaModule.getVolumes();
    assert.deepEqual( volumes[ 0 ].name, randomName );
  } )
} );