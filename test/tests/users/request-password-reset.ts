import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';

let users = new UsersPage();

describe('Request Password Reset: ', function () {
  before(async () => {
    const agent = await utils.refreshAdminToken();
    await utils.createAgent('RegisteredUser', 'registered333@test.com', 'password', true);
    await users.load(agent);
    assert(await users.$('.mt-user-list'));
  });

  it('it should show a message that an email was sent', async () => {
    await users.selectUser('registered333@test.com');
    await users.clickDrawer('Account Settings');
    await users.waitFor('.mt-reset-password');
    await users.click('.mt-reset-password');
    assert.equal(await users.appModule.getSnackMessage(), 'Password Reset has been sent');
  });
});
