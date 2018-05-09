import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';
import { randomId } from '../../utils/misc';
import ControllerFactory from '../../../../../src/core/controller-factory';
import { IPost } from 'modepress';
import { CategoriesController } from '../../../../../src/controllers/categories';

let postPage = new PostsPage();
let admin: Agent;
let controller: CategoriesController;
let rootCat = randomId();
let childCat = randomId();

describe( '3. Testing the interactions with categories in posts:', function() {

  before( async () => {
    controller = ControllerFactory.get( 'categories' );
    admin = await utils.refreshAdminToken();
    await postPage.load( admin, '/dashboard/posts/new' );
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

  it( 'can create a child level category', async () => {
    await postPage.categories.openCategoryForm();
    await postPage.categories.name( childCat );
    const parents = await postPage.categories.getParentCategories();
    assert( parents.includes( rootCat ) );
    postPage.categories.selectParent( rootCat );
    await postPage.categories.closeCategoryForm( true );
    const categories = await postPage.categories.getCategories();
    assert( categories.includes( childCat ) );
  } )

  it( 'can delete a category', async () => {
    let categories = await postPage.categories.getCategories();
    assert( categories.includes( childCat ) );
    await postPage.categories.deleteMode( true );
    await postPage.categories.selectCategories( childCat );
    await postPage.categories.confirmDeletion();
    await postPage.doneLoading();
    await postPage.closeSnackMessage();
    await postPage.categories.deleteMode( false );
    categories = await postPage.categories.getCategories();
    assert.equal( categories.indexOf( childCat ), -1 );
  } )

  after( async () => {
    let category = await controller.getBySlug( rootCat.toLowerCase() )
    await controller.remove( category._id.toString() );
  } )
} );