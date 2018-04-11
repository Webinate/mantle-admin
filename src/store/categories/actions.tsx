import { ActionCreator } from '../actions-creator';
import { Page, ICategory } from 'modepress';
import { categories } from 'modepress/lib-frontend';
import { IRootState } from '../';
import { ActionCreators as AppActions } from '../app/actions';

// Action Creators
export const ActionCreators = {
  SetCategoriesBusy: new ActionCreator<'categories-busy', boolean>( 'categories-busy' ),
  SetCategories: new ActionCreator<'categories-set-categories', Page<ICategory>>( 'categories-set-categories' ),
  SetCategory: new ActionCreator<'categories-set-category', ICategory>( 'categories-set-category' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function getCategories( index: number = 0, search?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
    const resp = await categories.getAll( { index: index, keyword: search } );
    dispatch( ActionCreators.SetCategories.create( resp ) );
  }
}

export function getCategory( id: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
    const resp = await categories.getOne( { id } );
    dispatch( ActionCreators.SetCategory.create( resp ) );
  }
}

export function createCategory( category: Partial<ICategory> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
      const resp = await categories.create( category );
      dispatch( AppActions.serverResponse.create( `New Category '${ resp.title }' created` ) );
      dispatch( ActionCreators.SetCategoriesBusy.create( false ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetCategoriesBusy.create( false ) );
    }
  }
}

export function editCategory( category: Partial<ICategory> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
      const resp = await categories.update( category._id, category );
      dispatch( AppActions.serverResponse.create( `Category '${ resp.title }' updated` ) );
      dispatch( ActionCreators.SetCategoriesBusy.create( false ) );
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetCategoriesBusy.create( false ) );
    }
  }
}