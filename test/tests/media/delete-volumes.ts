import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { randomId } from '../../utils/misc';
import Agent from '../../utils/agent';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IUserEntry } from '../../../../../src/types';

let page = new MediaPage();
let admin: Agent, joe: Agent;
const randomName = randomId();

describe('Testing the deletion of volumes:', function () {
  before(async () => {
    const volumes = ControllerFactory.get('volumes');
    const users = ControllerFactory.get('users');

    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');

    const userEntry = (await users.getUser({ username: joe.username })) as IUserEntry<'server'>;
    await volumes.create({ name: 'A', user: userEntry._id });
    await volumes.create({ name: 'B', user: userEntry._id });
    await volumes.create({ name: randomName, user: userEntry._id });
    await volumes.create({ name: 'D', user: userEntry._id });
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
