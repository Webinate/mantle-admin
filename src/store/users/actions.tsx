import { ActionCreator } from '../actions-creator';
import { UserTokens } from 'modepress';
import { IRootState } from '../';
import { getJson, apiUrl } from '../../utils/httpClients';

// Action Creators
export const ActionCreators = {
  SetUsersBusy: new ActionCreator<'SetUsersBusy', boolean>( 'SetUsersBusy' ),
  SetUsers: new ActionCreator<'SetUsers', UserTokens.GetAll.Response | null>( 'SetUsers' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getUsers( index: number = 0 ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetUsersBusy.create( true ) );
    const resp = await getJson<UserTokens.GetAll.Response>( `${ apiUrl }/users?index=${ index }` );
    dispatch( ActionCreators.SetUsers.create( resp ) );
  }
}