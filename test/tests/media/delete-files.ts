import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import Agent from '../../utils/agent';
import { Volume } from 'mantle';
import { randomId } from '../../utils/misc';
import { uploadFileToVolume } from '../../utils/file';
import AdminAgent from '../../utils/admin-agent';

let page = new MediaPage();
let admin: AdminAgent, joe: Agent;
let volume: Volume;
const randomName = randomId();

describe('Testing the deletion of files: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    const userEntry = await admin.getUser(joe.username);
    volume = await admin.addVolume({ name: randomName, user: userEntry._id });

    await uploadFileToVolume('img-a.png', volume._id, 'File A', joe);
    await uploadFileToVolume('img-b.png', volume._id, 'File B', joe);
    await uploadFileToVolume('img-c.png', volume._id, 'File C', joe);
    await uploadFileToVolume('img-c.png', volume._id, 'File D', joe);
  });

  it('can select and delete a single file', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.selectFile('File A');
    await page.mediaModule.clickDeleteFiles();
    await page.mediaModule.confirmModal();

    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files.length, 3);
    assert.deepEqual(
      files.find((f) => f.name === 'File A'),
      undefined
    );
  });

  it('allows admin to delete a file', async () => {
    await page.load(admin, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.selectFile('File B');
    await page.mediaModule.clickDeleteFiles();
    await page.mediaModule.confirmModal();

    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();

    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files.length, 2);
    assert.deepEqual(
      files.find((f) => f.name === 'File B'),
      undefined
    );
  });

  it('can delete multiple files at once', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.selectAll();
    await page.mediaModule.clickDeleteFiles();
    await page.mediaModule.confirmModal();

    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files.length, 0);
  });
});
