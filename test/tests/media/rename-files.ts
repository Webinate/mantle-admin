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
const randomFileName = randomId();

describe('Testing the renaming of files: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    const userEntry = await admin.getUser(joe.username);

    volume = await admin.addVolume({ name: randomName, user: userEntry!._id });
    await uploadFileToVolume('img-a.png', volume._id, joe);
  });

  it('can select and rename a single file', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.selectFile('img-a.png');
    await page.mediaModule.clickRenameFile();
    await page.mediaModule.newName(randomFileName);
    await page.mediaModule.confirmModal();

    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files[0].name, randomFileName);
  });

  it('allows an admin to rename a different users file', async () => {
    await page.load(admin, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.selectFile(randomFileName);
    await page.mediaModule.clickRenameFile();
    await page.mediaModule.newName('img-a.png');
    await page.mediaModule.confirmModal();

    let files = await page.mediaModule.getFiles();
    assert.deepEqual(files[0].name, 'img-a.png');

    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();

    files = await page.mediaModule.getFiles();
    assert.deepEqual(files[0].name, 'img-a.png');
  });
});
