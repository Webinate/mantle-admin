import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { Volume } from 'mantle';
import { uploadFileToVolume } from '../../utils/file';
import AdminAgent from '../../utils/admin-agent';
import Agent from '../../utils/agent';

let page = new MediaPage();
let joe: Agent;
let admin: AdminAgent;
let volA: Volume, volB: Volume, volC: Volume;

describe('Testing the sorting and filtering of volumes: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    const userEntry = await admin.getUser(joe.username);

    volA = await admin.addVolume({ name: 'A', user: userEntry._id });
    volB = await admin.addVolume({ name: 'B', user: userEntry._id });
    volC = await admin.addVolume({ name: 'C', user: userEntry._id });

    await uploadFileToVolume('img-a.png', volB._id, 'file', joe);
  });

  after(async () => {
    await admin.removeVolume(volA._id);
    await admin.removeVolume(volB._id);
    await admin.removeVolume(volC._id);
  });

  it('does show 3 volumes', async () => {
    await page.load(joe);
    await page.doneLoading();
    const volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes.length, 3);
  });

  it('does sort by creation date on load and they are correct', async () => {
    await page.load(joe);
    await page.doneLoading();
    const volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, 'C');
    assert.equal(volumes[1].name, 'B');
    assert.equal(volumes[2].name, 'A');
  });

  it('does sort by name when we click on the name filter', async () => {
    await page.load(joe);
    await page.doneLoading();
    await page.mediaModule.clickVolumeFilter('name');

    // First Desc
    let volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, 'C');
    assert.equal(volumes[1].name, 'B');
    assert.equal(volumes[2].name, 'A');

    // Now asc
    await page.mediaModule.clickVolumeFilter('name');
    volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, 'A');
    assert.equal(volumes[1].name, 'B');
    assert.equal(volumes[2].name, 'C');
  });

  it('does sort by date when we click on the name filter', async () => {
    await page.load(joe);
    await page.doneLoading();
    await page.mediaModule.clickVolumeFilter('created');

    // First Desc
    let volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, 'A');
    assert.equal(volumes[1].name, 'B');
    assert.equal(volumes[2].name, 'C');

    // Now asc
    await page.mediaModule.clickVolumeFilter('created');
    volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, 'C');
    assert.equal(volumes[1].name, 'B');
    assert.equal(volumes[2].name, 'A');
  });

  it('does sort by memory used', async () => {
    await page.load(joe);
    await page.doneLoading();
    await page.mediaModule.clickVolumeFilter('memory');

    // First Desc
    let volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, 'B');
    assert.equal(volumes[1].name, 'C');
    assert.equal(volumes[2].name, 'A');

    // Now asc
    await page.mediaModule.clickVolumeFilter('memory');
    volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[2].name, 'B');
  });
});
