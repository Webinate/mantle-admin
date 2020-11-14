import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { randomId } from '../../utils/misc';
import Agent from '../../utils/agent';
import AdminAgent from '../../utils/admin-agent';

let page = new MediaPage();
let admin: AdminAgent, joe: Agent;
const randomName = randomId();

describe('Testing the deletion of volumes:', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const userEntry = await admin.getUser(joe.username);
    await admin.addVolume({ name: 'A', user: userEntry._id });
    await admin.addVolume({ name: 'B', user: userEntry._id });
    await admin.addVolume({ name: randomName, user: userEntry._id });
    await admin.addVolume({ name: 'D', user: userEntry._id });
  });

  it('does show the 4 volumes created for the test', async () => {
    await page.load(joe);
    await page.doneLoading();
    const volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes.length, 4);
  });

  it('does delete single volume', async () => {
    await page.load(joe);
    await page.doneLoading();
    await page.mediaModule.selectVolume('A');
    await page.mediaModule.clickDeleteVolume();
    await page.mediaModule.confirmModal();

    const volumes = await page.mediaModule.getVolumes();
    assert.deepEqual(
      volumes.find((v) => v.name === 'A'),
      undefined
    );
  });

  it("does allow an admin to delete a user's volume", async () => {
    await page.load(admin);
    await page.doneLoading();
    await page.mediaModule.selectVolume(randomName);
    await page.mediaModule.clickDeleteVolume();
    await page.mediaModule.confirmModal();

    let volumes = await page.mediaModule.getVolumes();
    assert.deepEqual(
      volumes.find((v) => v.name === randomName),
      undefined
    );

    await page.load(joe);
    await page.doneLoading();

    volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes.length, 2);
  });

  it('can delete multiple volumes', async () => {
    await page.load(joe);
    await page.doneLoading();
    await page.mediaModule.selectAll();
    await page.mediaModule.clickDeleteVolume();
    await page.mediaModule.confirmModal();

    const volumes = await page.mediaModule.getVolumes();
    assert.equal(volumes.length, 0);
  });
});
