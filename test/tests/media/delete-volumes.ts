import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import { randomId } from '../../utils/misc';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import ControllerFactory from '../../../../../src/core/controller-factory';

let page = new MediaPage();
let admin: Agent, joe: Agent;
const randomName = randomId();

describe( 'Testing the deletion of volumes: ', function() {

  before( async () => {
    const volumes = ControllerFactory.get( 'volumes' );
    const users = ControllerFactory.get( 'users' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const userEntry = await users.getUser( { username: joe.username } );
    await volumes.create( { name: 'A', user: userEntry._id.toString() } );
    await volumes.create( { name: 'B', user: userEntry._id.toString() } );
    await volumes.create( { name: randomName, user: userEntry._id.toString() } );
    await volumes.create( { name: 'D', user: userEntry._id.toString() } );
  } )

  it( 'does show the 4 volumes created for the test', async () => {
    await page.load( joe );
    await page.doneLoading();
    const volumes = await page.getVolumes();
    assert.equal( volumes.length, 4 );
  } )

  it( 'does delete single volume', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.selectVolume( 'A' );
    await page.clickDeleteVolume();
    await page.confirmModal();

    const volumes = await page.getVolumes();
    assert.deepEqual( volumes.find( v => v.name === 'A' ), undefined )
  } )

  it( 'does allow an admin to delete a user\'s volume', async () => {
    await page.load( admin );
    await page.doneLoading();
    await page.selectVolume( randomName );
    await page.clickDeleteVolume();
    await page.confirmModal();

    let volumes = await page.getVolumes();
    assert.deepEqual( volumes.find( v => v.name === randomName ), undefined )

    await page.load( joe );
    await page.doneLoading();

    volumes = await page.getVolumes();
    assert.equal( volumes.length, 2 );
  } )

  it( 'can delete multiple volumes', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.selectAll();
    await page.clickDeleteVolume();
    await page.confirmModal();

    const volumes = await page.getVolumes();
    assert.equal( volumes.length, 0 );
  } )
} );