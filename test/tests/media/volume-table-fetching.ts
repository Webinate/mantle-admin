import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import { Volume } from 'mantle';
import { uploadFileToVolume } from '../../utils/file';
import AdminAgent from '../../utils/admin-agent';

let page = new MediaPage();
let admin: AdminAgent, joe: Agent;
let volume: Volume;

describe('Testing the fetching of volumes: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const userEntry = await admin.getUser(joe.username);
    volume = await admin.addVolume({
      name: randomId(),
      user: userEntry!._id,
    });

    await uploadFileToVolume('img-a.png', volume._id, joe);
  });

  after(async () => {
    await admin.removeVolume(volume._id);
  });

  it('does show 1 volume with correct stats', async () => {
    await page.load(joe);
    await page.doneLoading();
    const volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes.length, 1);
    assert.equal(volumes[0].name, volume.name);
    assert.equal(volumes[0].memory, '3.67 KB / 476.84 MB');
    assert.equal(volumes[0].type, 'local');
  });

  it("does show joe's volume when viewing as an admin", async () => {
    await page.load(admin);
    await page.doneLoading();
    const volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes[0].name, volume.name);
    assert.equal(volumes[0].memory, '3.67 KB / 476.84 MB');
    assert.equal(volumes[0].type, 'local');
  });
});
