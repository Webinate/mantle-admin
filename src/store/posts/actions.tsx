import { ActionCreator } from '../actions-creator';
import { PostTokens } from 'modepress-api';
import { IRootState } from '../';
import { getJson, apiUrl } from '../../utils/httpClients';

// Action Creators
export const ActionCreators = {
  SetPostsBusy: new ActionCreator<'posts-busy', boolean>( 'posts-busy' ),
  SetPosts: new ActionCreator<'posts-set-posts', PostTokens.GetAll.Response | null>( 'posts-set-posts' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getPosts( index: number = 0, search?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetPostsBusy.create( true ) );
    const resp = await getJson<PostTokens.GetAll.Response>(
      `${ apiUrl }/posts?index=${ index }${ search && search !== '' ? `&search=${ search }` : '' }` );
    dispatch( ActionCreators.SetPosts.create( resp ) );
  }
}