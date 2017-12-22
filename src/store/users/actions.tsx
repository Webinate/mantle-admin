import { ActionCreator } from '../actions-creator';
import { UserTokens } from 'modepress';
import { IRootState } from '../';
import { getJson, del, apiUrl } from '../../utils/httpClients';
import { ActionCreators as AppActionCreators } from '../app/actions';

// Action Creators
export const ActionCreators = {
  SetUsersBusy: new ActionCreator<'users-busy', boolean>( 'users-busy' ),
  SetUsers: new ActionCreator<'users-set-users', UserTokens.GetAll.Response | null>( 'users-set-users' ),
  RemoveUser: new ActionCreator<'users-remove-user', string>( 'users-remove-user' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getUsers( index: number = 0, search?: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetUsersBusy.create( true ) );
    const resp = await getJson<UserTokens.GetAll.Response>(
      `${ apiUrl }/users?index=${ index }${ search && search !== '' ? `&search=${ search }` : '' }` );
    dispatch( ActionCreators.SetUsers.create( resp ) );
  }
}

/**
 * Refreshes the user state
 */
export function removeUser( username: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetUsersBusy.create( true ) );
      await del( `${ apiUrl }/users/${ username }` );
      dispatch( ActionCreators.RemoveUser.create( username ) );
      dispatch( AppActionCreators.serverResponse.create( `User '${ username }' successfully removed` ) );
    }
    catch {
      dispatch( ActionCreators.SetUsersBusy.create( true ) );
    }
  }
}