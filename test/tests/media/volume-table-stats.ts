import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';
import { IVolume } from 'modepress';
import { VolumesController } from 'modepress/src/controllers/volumes';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { uploadFileToVolume } from '../../utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volumes: VolumesController;
let volume: IVolume<'client'>;

describe( 'Testing the display of volume table data: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    volumes = ControllerFactory.get( 'volumes' );
    const users = ControllerFactory.get( 'users' );
    const userEntry = await users.getUser( joe.username );
    volume = await volumes.create( {
      name: 'Test File Name',
      user: userEntry!.dbEntry._id.toString()
    } );

    await uploadFileToVolume( 'img-a.png', volume );
  } )

  after( async () => {
    await volumes.remove( { _id: volume._id } );
  } )

  it( 'does show 1 volume with correct stats', async () => {
    await page.load( joe );
    await page.doneLoading();
    const volumes = await page.getVolumes();
    assert.equal( volumes.length, 1 );
    assert.equal( volumes[ 0 ].name, 'Test File Name' );
    assert.equal( volumes[ 0 ].memory, '3.67 KB / 476.84 MB' );
    assert.equal( volumes[ 0 ].type, 'local' );
  } )
} );