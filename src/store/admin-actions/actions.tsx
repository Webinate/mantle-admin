import { ActionCreator } from '../actions-creator';
import { IRootState } from '../';
import { getJson, put, apiUrl, ClientError } from '../../utils/httpClients';
import { ActionCreators as AppActionCreators } from '../app/actions';
import { AuthTokens } from 'modepress';

// Action Creators
export const ActionCreators = {
  busy: new ActionCreator<'admin-busy', boolean>( 'admin-busy' ),
  userActivated: new ActionCreator<'admin-user-activated', string>( 'admin-user-activated' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function resetPassword( username: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.busy.create( true ) );

    try {
      const resp = await getJson<AuthTokens.RequestPasswordReset.Response>( `${ apiUrl }/auth/${ username }/request-password-reset` );
      dispatch( AppActionCreators.serverResponse.create( resp.message ) );
    }
    catch ( e ) {
      dispatch( AppActionCreators.serverResponse.create( ( e as ClientError ).response.statusText ) );
    }
  }
}

export function activate( username: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.busy.create( true ) );

    try {
      await put( `${ apiUrl }/auth/${ username }/approve-activation` );
      dispatch( ActionCreators.userActivated.create( username ) );
      dispatch( AppActionCreators.serverResponse.create( 'User successfully activated' ) );
    }
    catch ( e ) {
      dispatch( AppActionCreators.serverResponse.create( ( e as ClientError ).response.statusText ) );
    }
  }
}