import UsersPage from '../../pages/users';
import * as assert from 'assert';
import utils from '../../utils';
import Agent from '../../utils/agent';
import ControllerFactory from 'modepress/src/core/controller-factory';
import { IVolume } from 'modepress';

let users = new UsersPage();
let joe: Agent, mary: Agent, admin: Agent;
let volume: IVolume<'client'>;

describe( 'Update profile picture: ', function() {
  before( async () => {
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );
    mary = await utils.createAgent( 'Mary', 'mary333@test.com', 'password' );

    const usersCtrl = ControllerFactory.get( 'users' );
    const volumes = ControllerFactory.get( 'volumes' );
    const userEntry = await usersCtrl.getUser( { username: joe.username } );

    volume = await volumes.create( { name: 'test', user: userEntry._id.toString() } );
  } )

  it( 'it should not allow a regular user to change another\'s profile pic', async () => {
    await users.load( mary );
    await users.selectUser( 'joe222@test.com' );
    assert.deepEqual( await users.page.$( '#mt-upload-profile' ), null );
  } )

  it( 'it should allow an admin to change a users profile pic', async () => {
    await users.load( admin );
    await users.selectUser( 'joe222@test.com' );
    assert( await users.page.$( '#mt-upload-profile' ) !== null );
  } )

  it( 'it did upload a photo from the media navigator', async () => {
    await users.load( joe );

    await users.selectUser( 'joe222@test.com' );
    await users.selectProfilePic();

    // Check there is 1 volume and go into it
    const volumes = await users.mediaModule.getVolumes();
    assert.deepEqual( volumes.length, 1 );
    assert.deepEqual( volumes[ 0 ].name, 'test' );

    await users.mediaModule.selectVolume( 'test' );
    await users.mediaModule.openVolume();

    // Make sure there are no files
    let files = await users.mediaModule.getFiles();
    assert.deepEqual( files.length, 0 );

    // Upload an image file
    await users.mediaModule.uploadFile( 'img-a.png' );

    files = await users.mediaModule.getFiles();
    assert.deepEqual( files.length, 1 );
    assert.deepEqual( files[ 0 ].name, 'img-a.png' );

    await users.mediaModule.selectFile( 'img-a.png' );
    await users.mediaModule.confirmModal();

    const profileSrc = await users.getUserProfileImg();
    assert( profileSrc.endsWith( 'img-a.png' ) );

    const usersList = await users.getUsersFromList();
    assert( usersList[ 0 ].profileImg.endsWith( 'img-a.png' ) );

    const userAvatarSrc: string = await users.page.$eval( '.mt-user-menu img', ( img: HTMLImageElement ) => img.src );
    assert( userAvatarSrc.endsWith( 'img-a.png' ) );
  } );
} );