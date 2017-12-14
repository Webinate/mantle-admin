import { ActionCreator } from '../actions-creator';
import { IRootState } from '../';
import { getJson, get, apiUrl, ClientError } from '../../utils/httpClients';
import { AuthTokens } from 'modepress';

// Action Creators
export const ActionCreators = {
  busy: new ActionCreator<'admin-busy', boolean>( 'admin-busy' ),
  response: new ActionCreator<'admin-response', string>( 'admin-response' ),
  error: new ActionCreator<'admin-error', string>( 'admin-error' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function resetPassword( username: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.busy.create( true ) );

    try {
      const resp = await getJson<AuthTokens.RequestPasswordReset.Response>( `${ apiUrl }/auth/${ username }/request-password-reset` );
      dispatch( ActionCreators.response.create( resp.message ) );
    }
    catch ( e ) {
      dispatch( ActionCreators.error.create( ( e as ClientError ).response.statusText ) );
    }
  }
}

export function activate( username: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.busy.create( true ) );

    try {
      await get( `${ apiUrl }/auth/${ username }/approve-activation` );
      dispatch( ActionCreators.response.create( 'User successfully activated' ) );
    }
    catch ( e ) {
      dispatch( ActionCreators.error.create( ( e as ClientError ).response.statusText ) );
    }
  }
}