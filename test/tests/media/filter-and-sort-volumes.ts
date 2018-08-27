import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { IVolume } from 'modepress';
import { VolumesController } from '../../../../../src/controllers/volumes';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { uploadFileToVolume } from '../../utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volumes: VolumesController;
let volA: IVolume<'client'>, volB: IVolume<'client'>, volC: IVolume<'client'>;

describe( 'Testing the sorting and filtering of volumes: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    volumes = ControllerFactory.get( 'volumes' );
    const users = ControllerFactory.get( 'users' );
    const userEntry = await users.getUser( joe.username );
    const files = ControllerFactory.get( 'files' );
    volA = await volumes.create( { name: 'A', user: userEntry.dbEntry._id.toString() } );
    volB = await volumes.create( { name: 'B', user: userEntry.dbEntry._id.toString() } );
    volC = await volumes.create( { name: 'C', user: userEntry.dbEntry._id.toString() } );

    await uploadFileToVolume( 'img-a.png', volB );
  } )

  after( async () => {
    await volumes.remove( { _id: volA._id } );
    await volumes.remove( { _id: volB._id } );
    await volumes.remove( { _id: volC._id } );
  } )

  it( 'does show 3 volumes', async () => {
    await page.load( joe );
    await page.doneLoading();
    const volumes = await page.getVolumes();
    assert.equal( volumes.length, 3 )
  } )

  it( 'does sort by creation date on load and they are correct', async () => {
    await page.load( joe );
    await page.doneLoading();
    const volumes = await page.getVolumes();
    assert.equal( volumes[ 0 ].name, 'C' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'A' );
  } )

  it( 'does sort by name when we click on the name filter', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.clickVolumeFilter( 'name' );

    // First Desc
    let volumes = await page.getVolumes();
    assert.equal( volumes[ 0 ].name, 'C' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'A' );

    // Now asc
    await page.clickVolumeFilter( 'name' );
    volumes = await page.getVolumes();
    assert.equal( volumes[ 0 ].name, 'A' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'C' );
  } )

  it( 'does sort by date when we click on the name filter', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.clickVolumeFilter( 'created' );

    // First Desc
    let volumes = await page.getVolumes();
    assert.equal( volumes[ 0 ].name, 'A' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'C' );

    // Now asc
    await page.clickVolumeFilter( 'created' );
    volumes = await page.getVolumes();
    assert.equal( volumes[ 0 ].name, 'C' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'A' );
  } )

  it( 'does sort by memory used', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.clickVolumeFilter( 'memory' );

    // First Desc
    let volumes = await page.getVolumes();
    assert.equal( volumes[ 0 ].name, 'B' );
    assert.equal( volumes[ 1 ].name, 'C' );
    assert.equal( volumes[ 2 ].name, 'A' );

    // Now asc
    await page.clickVolumeFilter( 'memory' );
    volumes = await page.getVolumes();
    assert.equal( volumes[ 2 ].name, 'B' );
  } )
} );