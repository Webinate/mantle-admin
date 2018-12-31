import { ActionCreator } from '../actions-creator';
import { Page, IComment } from '../../../../../src';
import { CommentGetAllOptions } from 'modepress';
import * as comments from '../../../../../src/lib-frontend/comments';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';

// Action Creators
export const ActionCreators = {
  SetCommentsBusy: new ActionCreator<'comments-busy', boolean>( 'comments-busy' ),
  SetComments: new ActionCreator<'comments-set-comments', { page: Page<IComment<'client' | 'expanded'>>, filters: Partial<CommentGetAllOptions> }>( 'comments-set-comments' ),
  SetComment: new ActionCreator<'comments-set-comment', IComment<'client' | 'expanded'>>( 'comments-set-comment' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Gets all the comments
 */
export function getComments( options: Partial<CommentGetAllOptions>, postId?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    const state = getState();
    const newFilters = { ...state.comments.commentFilters, ...options };

    // Resets the array first
    dispatch( ActionCreators.SetCommentsBusy.create( true ) );

    let resp: Page<IComment<'client' | 'expanded'>>;

    resp = await comments.getAll( newFilters );

    dispatch( ActionCreators.SetComments.create( { page: resp, filters: newFilters } ) );
  }
}

export function createComment( postId: string, comment: Partial<IComment<'client'>>, parent?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCommentsBusy.create( true ) );
      await comments.create( postId, comment, parent );
      dispatch( getComments( {} ) )
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
    }
  }
}

export function editComment( commentId: string, token: Partial<IComment<'client'>> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCommentsBusy.create( true ) );
      await comments.update( commentId, token );
      dispatch( getComments( {} ) )
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
    }
  }
}

export function deleteComment( commentId: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetCommentsBusy.create( true ) );
      await comments.remove( commentId );
      dispatch( getComments( {} ) )
    }
    catch ( err ) {
      dispatch( AppActions.serverResponse.create( `Error: ${ err.message }` ) );
    }
  }
}