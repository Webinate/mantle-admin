import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import { IVolume } from 'mantle/src/types';
import { VolumesController } from 'mantle/src/controllers/volumes';
import ControllerFactory from 'mantle/src/core/controller-factory';
import { uploadFileToVolume } from '../../utils/file';

let page = new MediaPage();
let admin: Agent, joe: Agent;
let volumes: VolumesController;
let volume: IVolume<'server'>;

describe('Testing the fetching of volumes: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    volumes = ControllerFactory.get('volumes');
    const users = ControllerFactory.get('users');
    const userEntry = await users.getUser({ username: joe.username });
    volume = await volumes.create({
      name: randomId(),
      user: userEntry!._id,
    });

    await uploadFileToVolume('img-a.png', volume);
  });

  after(async () => {
    await volumes.remove({ _id: volume._id });
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
