import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'modepress';

let postPage = new PostsPage();
let admin: Agent;
let post: IPost<'client'>;
let rootCat = randomId();
let childCat = randomId();
let childDeeperCat = randomId();

describe( 'Testing the interactions with categories in posts:', function() {

  before( async () => {
    const posts = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    post = await posts.create( {
      title: 'Test Post',
      brief: 'Oh my brief',
      tags: [ 'Tag 1', 'Tag 2' ],
      slug: randomId(),
      public: false,
      content: 'This is a post\'s content'
    } )

    await postPage.load( admin, `/dashboard/posts/edit/${ post._id }` );
    await postPage.waitFor( '#mt-post-title' );
    await postPage.openPanel( 'categories' );
    await postPage.openPanel( 'tags' );
  } )

  after( async () => {
    await ControllerFactory.get( 'posts' ).removePost( post._id.toString() );
    const categories = ControllerFactory.get( 'categories' );
    const category = await categories.getBySlug( rootCat.toLowerCase() )
    await categories.remove( category._id );
  } )

  it( 'does autofill the category when none is set', async () => {
    await postPage.categories.openCategoryForm();
    await postPage.categories.name( 'New Category' );
    assert.equal( await postPage.categories.slug(), 'new-category' );

    await postPage.categories.slug( 'custom-slug' );
    await postPage.categories.name( 'Second Attempt' );

    assert.equal( await postPage.categories.slug(), 'custom-slug' );
    await postPage.categories.closeCategoryForm();
  } )

  it( 'does clear values when you re-open the form', async () => {
    await postPage.categories.openCategoryForm();
    await postPage.categories.name( 'New Category' );
    await postPage.categories.closeCategoryForm();
    await postPage.categories.openCategoryForm();
    assert.equal( await postPage.categories.name(), '' );
    await postPage.categories.closeCategoryForm();
  } )

  it( 'can create and remove tags', async () => {
    await postPage.categories.openCategoryForm();
    await postPage.categories.addTag( 'test' );
    await postPage.categories.addTag( '  test2  ' );
    const tags = await postPage.categories.getTags();
    assert.notEqual( tags.indexOf( 'test' ), -1 );
    assert.notEqual( tags.indexOf( 'test2' ), -1 );
    await postPage.categories.closeCategoryForm( false );
  } )

  it( 'can create a simple root level category', async () => {
    await postPage.categories.openCategoryForm();
    await postPage.categories.name( rootCat );
    await postPage.categories.closeCategoryForm( true );
    const categories = await postPage.categories.getCategories();
    assert( categories.includes( rootCat ) );
  } )

  it( 'can edit the root level category', async () => {
    await postPage.categories.editMode( true );
    await postPage.categories.selectCategories( rootCat );
    await postPage.categories.name( 'I_AM_ROOT' );
    await postPage.categories.description( 'I_AM_ROOT' );
    await postPage.categories.closeCategoryForm( true );

    // Make sure the edit is saved
    let categories = await postPage.categories.getCategories();
    assert( categories.includes( 'I_AM_ROOT' ) );

    // Go back into edit mode and select the root
    await postPage.categories.editMode( true );
    await postPage.categories.selectCategories( 'I_AM_ROOT' );

    // Make sure the name and description were saved
    assert.equal( await postPage.categories.name(), 'I_AM_ROOT' );
    assert.equal( await postPage.categories.description(), 'I_AM_ROOT' );

    // Save it back to normal
    await postPage.categories.name( rootCat );
    await postPage.categories.closeCategoryForm( true );
  } )

  it( 'can create a child level category', async () => {
    // Create a 1 deep child
    await postPage.categories.openCategoryForm();
    await postPage.categories.name( childCat );
    const parents = await postPage.categories.getParentCategories();

    assert( parents.includes( rootCat ) );

    await postPage.categories.selectParent( rootCat );
    await postPage.categories.closeCategoryForm( true );
    let categories = await postPage.categories.getCategories();

    assert( categories.includes( childCat ) );

    // Create a child of the child
    await postPage.categories.openCategoryForm();
    await postPage.categories.name( childDeeperCat );
    await postPage.categories.selectParent( childCat );
    await postPage.categories.closeCategoryForm( true );
    categories = await postPage.categories.getCategories();

    assert( categories.includes( childDeeperCat ) );

    // Assert the hierarchy
    const hierarchy = await postPage.categories.getCategoryHierarchy( rootCat );
    assert( hierarchy[ rootCat ] );
    assert( hierarchy[ rootCat ][ childCat ] );
    assert( hierarchy[ rootCat ][ childCat ][ childDeeperCat ] );
  } )

  it( 'can delete a category and its children', async () => {
    let categories = await postPage.categories.getCategories();
    assert( categories.includes( childCat ) );
    await postPage.categories.deleteMode( true );
    await postPage.categories.selectCategories( childCat );
    await postPage.categories.confirmDeletion();
    await postPage.doneLoading();
    await postPage.appModule.closeSnackMessage();
    await postPage.categories.deleteMode( false );
    categories = await postPage.categories.getCategories();

    // Check it does not have root's children
    assert.equal( categories.indexOf( childCat ), -1 );
    assert.equal( categories.indexOf( childDeeperCat ), -1 );
  } )
} );