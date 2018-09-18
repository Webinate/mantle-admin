import { ActionCreator } from '../actions-creator';
import { Page, IComment } from '../../../../../src';
import * as comments from '../../../../../src/lib-frontend/comments';
import { IRootState } from '..';

// Action Creators
export const ActionCreators = {
  SetCommentsBusy: new ActionCreator<'comments-busy', boolean>( 'comments-busy' ),
  SetComments: new ActionCreator<'comments-set-comments', { page: Page<IComment<'client'>>, filters: Partial<comments.GetAllOptions> }>( 'comments-set-comments' ),
  SetComment: new ActionCreator<'comments-set-comment', IComment<'client'>>( 'comments-set-comment' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Gets all the comments
 */
export function getComments( options: Partial<comments.GetAllOptions> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    const state = getState();
    const newFilters: Partial<comments.GetAllOptions> = state.comments.commentFilters ?
      { ...state.comments.commentFilters, ...options } : options;

    dispatch( ActionCreators.SetCommentsBusy.create( true ) );
    const resp = await comments.getAll( newFilters );
    dispatch( ActionCreators.SetComments.create( { page: resp, filters: newFilters } ) );
  }
}