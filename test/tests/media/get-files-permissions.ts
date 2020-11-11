import MediaPage from '../../../test/pages/media';
import * as assert from 'assert';
import utils from '../../../test/utils';
import {} from 'mocha';
import Agent from '../../../test/utils/agent';
import { Volume } from 'mantle';
import { uploadFileToVolume } from '../../../test/utils/file';
import AdminAgent from '../../utils/admin-agent';

let page = new MediaPage();
let admin: AdminAgent, joe: Agent, mary: Agent;
let volume: Volume;

describe('Testing the fetching of files & permissions: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    mary = await utils.createAgent('Mary', 'mary333@test.com', 'password');

    const userEntry = await admin.getUser(joe.username);
    volume = await admin.addVolume({ name: 'test', user: userEntry!._id });

    await uploadFileToVolume('img-a.png', volume._id, 'File A', joe);
    await uploadFileToVolume('img-b.png', volume._id, 'File B', joe);
    await uploadFileToVolume('img-c.png', volume._id, 'File C', joe);
  });

  after(async () => {
    await admin.removeVolume(volume._id);
  });

  it('does show 3 files for the user who uploaded then', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files.length, 3);
  });

  it('prevents non-admin users from seeing another users volume', async () => {
    await page.load(mary, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    const files = await page.mediaModule.getFiles();
    const message = await page.appModule.getSnackMessage();
    assert.deepEqual(files.length, 0);
    assert.deepEqual(message, 'You do not have permission');
  });

  it('does allow an admin to see a users volume', async () => {
    await page.load(admin, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files.length, 3);
  });
});
