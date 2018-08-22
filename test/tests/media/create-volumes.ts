import MediaPage from 'modepress/clients/modepress-admin/test/pages/media';
import * as assert from 'assert';
import utils from 'modepress/clients/modepress-admin/test/utils';
import { } from 'mocha';
import Agent from 'modepress/clients/modepress-admin/test/utils/agent';

let page = new MediaPage();
let admin: Agent, joe: Agent;

describe( 'Testing the creation of volumes: ', function() {

  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    await page.load( admin );
  } )

  it( 'does not let regular users set the memory allocated field', async () => {
    await page.load( joe );
    await page.clickNewVolume();
    await page.clickNext();
    assert.deepEqual( await page.volumeMemoryEnabled(), false );
  } )

  it( 'does allow admin editting memory', async () => {
    await page.load( admin );
    await page.clickNewVolume();
    await page.clickNext();
    assert.deepEqual( await page.volumeMemoryEnabled(), false );
  } )

  it( 'does not allow an empty volume name', async () => {
    await page.load( joe );
    await page.clickNewVolume();
    await page.clickNext();
    await page.volumeName( '' );
    assert.equal( await page.volumeNameError(), 'Name cannot be empty' );

    await page.volumeName( 'New Local' );
    assert.deepEqual( await page.volumeNameError(), null );
  } )

  it( 'does not allow 0 for memory', async () => {
    await page.load( admin );
    await page.clickNewVolume();
    await page.clickNext();
    await page.volumeMemory( '0' );
    assert.equal( await page.volumeMemoryError(), 'Allocated memory cannot be 0' );

    await page.volumeMemory( '50000' );
    assert.deepEqual( await page.volumeMemoryError(), '48.83 KB' );
  } )

  // Check for max size
} );