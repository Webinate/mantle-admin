import { ActionCreator } from '../actions-creator';
import { Page, ICategory } from 'modepress';
import { categories } from 'modepress/src/lib-frontend';
import { IRootState } from '../';
import { ActionCreators as AppActions } from '../app/actions';

// Action Creators
export const ActionCreators = {
  SetCategoriesBusy: new ActionCreator<'categories-busy', boolean>( 'categories-busy' ),
  SetCategories: new ActionCreator<'categories-set-categories', Page<ICategory<'client'>>>( 'categories-set-categories' ),
  SetCategory: new ActionCreator<'categories-set-category', ICategory<'client'>>( 'categories-set-category' ),
  SetCategoryErr: new ActionCreator<'categories-set-err', string | null>( 'categories-set-err' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function getCategories( index: number = 0, limit?: number ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
    const resp = await categories.getAll( {
      index: index, limit: limit, expanded: true, depth: -1, root: true
    } );
    dispatch( ActionCreators.SetCategories.create( resp ) );
  }
}

export function editCategory( category: Partial<ICategory<'client'>>, callback?: () => void ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
      const resp = await categories.edit( category._id as string, category );
      dispatch( AppActions.serverResponse.create( `Category '${ resp.title }' updated` ) );
      dispatch( getCategories() );

      if ( callback )
        callback();
    }
    catch ( err ) {
      dispatch( ActionCreators.SetCategoryErr.create( `Error: ${ err.message }` ) );
    }
  }
}

export function createCategory( category: Partial<ICategory<'client'>>, callback?: () => void ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
      const resp = await categories.create( category );
      dispatch( AppActions.serverResponse.create( `New Category '${ resp.title }' created` ) );
      dispatch( getCategories() )

      if ( callback )
        callback();
    }
    catch ( err ) {
      dispatch( ActionCreators.SetCategoryErr.create( `Error: ${ err.message }` ) );
    }
  }
}

export function removeCategory( category: ICategory<'client'> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCategoriesBusy.create( true ) );
      await categories.remove( category._id );
      dispatch( AppActions.serverResponse.create( `Category '${ category.title }' removed` ) );
      dispatch( getCategories() )
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
      dispatch( ActionCreators.SetCategoriesBusy.create( false ) );
    }
  }
}