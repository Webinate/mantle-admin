import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import { randomId } from 'modepress/clients/modepress-admin/test/utils/misc';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
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

    const userEntry = await users.getUser( joe.username );
    await volumes.create( { name: randomName, user: userEntry.dbEntry._id.toString() } );
  } )

  it( 'does allow a user to rename a volume', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.selectVolume( randomName );
    await page.clickRenameVolume();
    await page.newName( newRandomName );
    await page.confirmModal();

    const volumes = await page.getVolumes();
    assert.deepEqual( volumes[ 0 ].name, newRandomName );
  } )

  it( 'does allow an admin to rename a users volume', async () => {
    await page.load( admin );
    await page.doneLoading();
    await page.selectVolume( newRandomName );
    await page.clickRenameVolume();
    await page.newName( randomName );
    await page.confirmModal();

    await page.load( joe );
    const volumes = await page.getVolumes();
    assert.deepEqual( volumes[ 0 ].name, randomName );
  } )
} );