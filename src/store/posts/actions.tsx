import { ActionCreator } from '../actions-creator';
import { Page, IPost } from 'modepress';
import { posts } from 'modepress/lib-frontend';
import { IRootState } from '../';

// Action Creators
export const ActionCreators = {
  SetPostsBusy: new ActionCreator<'posts-busy', boolean>( 'posts-busy' ),
  SetPosts: new ActionCreator<'posts-set-posts', Page<IPost>>( 'posts-set-posts' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getPosts( index: number = 0, search?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetPostsBusy.create( true ) );
    const resp = await posts.getAll( { index: index, keyword: search } );
    dispatch( ActionCreators.SetPosts.create( resp ) );
  }
}