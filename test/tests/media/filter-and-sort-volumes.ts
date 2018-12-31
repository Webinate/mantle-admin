import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { IVolume } from 'modepress';
import { VolumesController } from '../../../../../src/controllers/volumes';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { uploadFileToVolume } from '../../utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volumes: VolumesController;
let volA: IVolume<'expanded'>, volB: IVolume<'expanded'>, volC: IVolume<'expanded'>;

describe( 'Testing the sorting and filtering of volumes: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    volumes = ControllerFactory.get( 'volumes' );
    const users = ControllerFactory.get( 'users' );
    const userEntry = await users.getUser( { username: joe.username } );
    const files = ControllerFactory.get( 'files' );
    volA = await volumes.create( { name: 'A', user: userEntry._id.toString() } ) as IVolume<'expanded'>;
    volB = await volumes.create( { name: 'B', user: userEntry._id.toString() } ) as IVolume<'expanded'>;
    volC = await volumes.create( { name: 'C', user: userEntry._id.toString() } ) as IVolume<'expanded'>;

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
    const volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes.length, 3 )
  } )

  it( 'does sort by creation date on load and they are correct', async () => {
    await page.load( joe );
    await page.doneLoading();
    const volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 0 ].name, 'C' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'A' );
  } )

  it( 'does sort by name when we click on the name filter', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.mediaModule.clickVolumeFilter( 'name' );

    // First Desc
    let volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 0 ].name, 'C' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'A' );

    // Now asc
    await page.mediaModule.clickVolumeFilter( 'name' );
    volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 0 ].name, 'A' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'C' );
  } )

  it( 'does sort by date when we click on the name filter', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.mediaModule.clickVolumeFilter( 'created' );

    // First Desc
    let volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 0 ].name, 'A' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'C' );

    // Now asc
    await page.mediaModule.clickVolumeFilter( 'created' );
    volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 0 ].name, 'C' );
    assert.equal( volumes[ 1 ].name, 'B' );
    assert.equal( volumes[ 2 ].name, 'A' );
  } )

  it( 'does sort by memory used', async () => {
    await page.load( joe );
    await page.doneLoading();
    await page.mediaModule.clickVolumeFilter( 'memory' );

    // First Desc
    let volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 0 ].name, 'B' );
    assert.equal( volumes[ 1 ].name, 'C' );
    assert.equal( volumes[ 2 ].name, 'A' );

    // Now asc
    await page.mediaModule.clickVolumeFilter( 'memory' );
    volumes = await page.mediaModule.getVolumes();
    assert.equal( volumes[ 2 ].name, 'B' );
  } )
} );