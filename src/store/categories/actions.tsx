import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';
import {
  PaginatedCategoryResponse,
  QueryCategoriesArgs,
  AddCategoryInput,
  UpdateCategoryInput,
  Category,
} from 'mantle';
import { graphql } from '../../utils/httpClients';
import {
  getCategoriesQuery,
  PATCH_CATEGORY,
  ADD_CATEGORY,
  REMOVE_CATEGORY,
} from '../../graphql/requests/category-requests';

// Action Creators
export const ActionCreators = {
  SetCategoriesBusy: new ActionCreator<'categories-busy', boolean>('categories-busy'),
  SetCategories: new ActionCreator<'categories-set-categories', PaginatedCategoryResponse>('categories-set-categories'),
  SetCategory: new ActionCreator<'categories-set-category', Category>('categories-set-category'),
  SetCategoryErr: new ActionCreator<'categories-set-err', string | null>('categories-set-err'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  async getCategories(options: Partial<QueryCategoriesArgs>, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetCategoriesBusy.create(true));
    options.root = options.root === undefined ? true : options.root;

    const resp = await graphql<{ categories: PaginatedCategoryResponse }>(getCategoriesQuery(3), {
      ...options,
    });
    dispatch!(ActionCreators.SetCategories.create(resp.categories));
  }

  @disptachable()
  @dispatchError(ActionCreators.SetCategoryErr, { prefix: 'Error: ' })
  async editCategory(
    category: Partial<UpdateCategoryInput>,
    callback?: () => void,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetCategoriesBusy.create(true));
    if (category.parent === '') category.parent = null;

    const resp = await graphql<{ updateCategory: Category }>(PATCH_CATEGORY, { token: category });
    // const resp = await categories.edit(category._id as string, category);
    dispatch!(AppActions.serverResponse.create(`Category '${resp.updateCategory.title}' updated`));

    const getCategoriesPromise = this.getCategories({});
    dispatch!(getCategoriesPromise);

    await getCategoriesPromise;
    if (callback) callback();
  }

  @disptachable()
  @dispatchError(ActionCreators.SetCategoryErr, { prefix: 'Error: ' })
  async createCategory(
    category: Partial<AddCategoryInput>,
    callback?: () => void,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetCategoriesBusy.create(true));
    const resp = await graphql<{ createCategory: Category }>(ADD_CATEGORY, { token: category });
    // const resp = await categories.create(category);
    dispatch!(AppActions.serverResponse.create(`New Category '${resp.createCategory.title}' created`));
    dispatch!(this.getCategories({}));

    if (callback) callback();
  }

  @disptachable()
  async removeCategory(category: Category, dispatch?: Function, getState?: () => IRootState) {
    try {
      dispatch!(ActionCreators.SetCategoriesBusy.create(true));
      await graphql<{ removeCategory: Category }>(REMOVE_CATEGORY, { id: category._id });
      // await categories.remove(category._id);
      dispatch!(AppActions.serverResponse.create(`Category '${category.title}' removed`));
      dispatch!(this.getCategories({}));
    } catch (err) {
      dispatch!(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch!(ActionCreators.SetCategoriesBusy.create(false));
    }
  }
}

const actions: Actions = new Actions();
export default actions;
