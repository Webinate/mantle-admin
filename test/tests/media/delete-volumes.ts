import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import ControllerFactory from '../../../../../src/core/controller-factory';

let page = new MediaPage();
let admin: Agent, joe: Agent;


describe( 'Testing the deletion of volumes: ', function() {

  before( async () => {
    const volumes = ControllerFactory.get( 'volumes' );
    const users = ControllerFactory.get( 'users' );

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    const userEntry = await users.getUser( joe.username );
    await volumes.create( { name: 'A', user: userEntry.dbEntry._id.toString() } );
    await volumes.create( { name: 'B', user: userEntry.dbEntry._id.toString() } );
    await volumes.create( { name: 'C', user: userEntry.dbEntry._id.toString() } );
    await volumes.create( { name: 'D', user: userEntry.dbEntry._id.toString() } );
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
    await page.confirmDelete();

    const volumes = await page.getVolumes();
    assert.deepEqual( volumes.find( v => v.name === 'A' ), undefined )
  } )
} );