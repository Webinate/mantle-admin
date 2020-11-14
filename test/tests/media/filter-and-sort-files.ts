import MediaPage from '../../pages/media';
import * as assert from 'assert';
import utils from '../../utils';
import {} from 'mocha';
import { Volume } from 'mantle';
import { uploadFileToVolume } from '../../utils/file';
import AdminAgent from '../../utils/admin-agent';
import Agent from '../../utils/agent';

let page = new MediaPage();
let admin: AdminAgent;
let joe: Agent;
let volume: Volume;

describe('Testing the sorting and filtering of files: ', function () {
  before(async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent('Joe', 'joe222@test.com', 'password');
    const userEntry = await admin.getUser(joe.username);

    volume = await admin.addVolume({ name: 'test', user: userEntry._id });

    await uploadFileToVolume('img-a.png', volume._id, joe);
    await uploadFileToVolume('img-b.png', volume._id, joe);
    await uploadFileToVolume('img-c.png', volume._id, joe);
  });

  after(async () => {
    await admin.removeVolume(volume._id);
  });

  it('does have three files uploaded & sorted by upload date', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();

    const files = await page.mediaModule.getFiles();
    assert.deepEqual(files.length, 3);
    assert.deepEqual(files[0].name, 'img-c.png');
    assert.deepEqual(files[2].name, 'img-a.png');
  });

  it('does filter based on name', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.clickFileFilter('name');

    let files = await page.mediaModule.getFiles();
    assert.deepEqual(files[0].name, 'img-c.png');
    assert.deepEqual(files[1].name, 'img-b.png');
    assert.deepEqual(files[2].name, 'img-a.png');

    await page.mediaModule.clickFileFilter('name');
    files = await page.mediaModule.getFiles();

    assert.deepEqual(files[0].name, 'img-a.png');
    assert.deepEqual(files[1].name, 'img-b.png');
    assert.deepEqual(files[2].name, 'img-c.png');
  });

  it('does filter based on memory', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.clickFileFilter('memory');

    let files = await page.mediaModule.getFiles();
    assert.deepEqual(files[0].name, 'img-c.png');
    assert.deepEqual(files[1].name, 'img-b.png');
    assert.deepEqual(files[2].name, 'img-a.png');

    await page.mediaModule.clickFileFilter('memory');
    files = await page.mediaModule.getFiles();

    assert.deepEqual(files[0].name, 'img-a.png');
    assert.deepEqual(files[1].name, 'img-b.png');
    assert.deepEqual(files[2].name, 'img-c.png');
  });

  it('does filter based on upload date', async () => {
    await page.load(joe, `/dashboard/media/volume/${volume._id}`);
    await page.doneLoading();
    await page.mediaModule.clickFileFilter('created');

    let files = await page.mediaModule.getFiles();
    assert.deepEqual(files[0].name, 'img-a.png');
    assert.deepEqual(files[1].name, 'img-b.png');
    assert.deepEqual(files[2].name, 'img-c.png');

    await page.mediaModule.clickFileFilter('created');
    files = await page.mediaModule.getFiles();

    assert.deepEqual(files[0].name, 'img-c.png');
    assert.deepEqual(files[1].name, 'img-b.png');
    assert.deepEqual(files[2].name, 'img-a.png');
  });
});
