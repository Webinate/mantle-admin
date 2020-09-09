import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';
import { PaginatedCategoryResponse, AddCategoryInput, UpdateCategoryInput, Category } from 'mantle';
import { graphql } from '../../utils/httpClients';
import {
  GET_CATEGORIES,
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
  async getCategories(index: number = 0, limit?: number, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetCategoriesBusy.create(true));
    const resp = await graphql<PaginatedCategoryResponse>(GET_CATEGORIES, { index: index, limit: limit, root: true });
    dispatch!(ActionCreators.SetCategories.create(resp));
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
    const resp = await graphql<Category>(PATCH_CATEGORY, { token: category });
    // const resp = await categories.edit(category._id as string, category);
    dispatch!(AppActions.serverResponse.create(`Category '${resp.title}' updated`));
    dispatch!(this.getCategories());

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
    const resp = await graphql<Category>(ADD_CATEGORY, { token: category });
    // const resp = await categories.create(category);
    dispatch!(AppActions.serverResponse.create(`New Category '${resp.title}' created`));
    dispatch!(this.getCategories());

    if (callback) callback();
  }

  @disptachable()
  async removeCategory(category: Category, dispatch?: Function, getState?: () => IRootState) {
    try {
      dispatch!(ActionCreators.SetCategoriesBusy.create(true));
      await graphql<Category>(REMOVE_CATEGORY, { id: category._id });
      // await categories.remove(category._id);
      dispatch!(AppActions.serverResponse.create(`Category '${category.title}' removed`));
      dispatch!(this.getCategories());
    } catch (err) {
      dispatch!(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch!(ActionCreators.SetCategoriesBusy.create(false));
    }
  }
}

const actions: Actions = new Actions();
export default actions;
