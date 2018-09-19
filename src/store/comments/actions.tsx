import { ActionCreator } from '../actions-creator';
import { Page, IComment } from '../../../../../src';
import * as comments from '../../../../../src/lib-frontend/comments';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';

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
export function getComments( options: Partial<comments.GetAllOptions>, postId?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    const state = getState();
    const newFilters: Partial<comments.GetAllOptions> = state.comments.commentFilters ?
      { ...state.comments.commentFilters, ...options } : options;

    dispatch( ActionCreators.SetCommentsBusy.create( true ) );
    let resp: Page<IComment<'client'>>;
    if ( !postId )
      resp = await comments.getAll( newFilters );
    else
      resp = await comments.getAllFromParent( postId, newFilters );

    dispatch( ActionCreators.SetComments.create( { page: resp, filters: newFilters } ) );
  }
}

export function createComment( postId: string, comment: Partial<IComment<'client'>> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCommentsBusy.create( true ) );
      await comments.create( postId, comment );;
      dispatch( getComments( {} ) )
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
    }
  }
}