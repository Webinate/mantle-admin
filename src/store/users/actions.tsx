import { ActionCreator } from '../actions-creator';
import { IUserEntry, IGetUsers } from 'modepress';
import { IRootState } from '../';
import { get, apiUrl } from '../../utils/httpClients';

// Action Creators
export const ActionCreators = {
  SetUsersBusy: new ActionCreator<'SetUsersBusy', boolean>( 'SetUsersBusy' ),
  SetUsers: new ActionCreator<'SetUsers', IUserEntry[] | null>( 'SetUsers' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getUsers() {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetUsersBusy.create( true ) );

    const resp = await get<IGetUsers>( `${ apiUrl }/users` );

    if ( !resp.error )
      dispatch( ActionCreators.SetUsers.create( resp.data ) );
  }
}