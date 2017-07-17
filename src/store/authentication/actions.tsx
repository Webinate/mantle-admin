import { ActionCreator } from '../actions-creator';
import { IRootState } from '../';
import { post } from '../../utils/httpClients';
import { ILoginToken, IAuthenticationResponse } from 'modepress';

// Action Creators
export const ActionCreators = {
  isAuthenticating: new ActionCreator<'isAuthenticating', boolean>( 'isAuthenticating' ),
  authenticationError: new ActionCreator<'authenticationError', string>( 'authenticationError' ),
  authenticationResponse: new ActionCreator<'authenticationResponse', IAuthenticationResponse>( 'authenticationResponse' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function login( authToken: ILoginToken ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.isAuthenticating.create( true ) );

    try {
      const resp = await post<IAuthenticationResponse>( 'auth/login', authToken );
      if ( resp.error )
        dispatch( ActionCreators.authenticationError.create( resp.message ) );
      else
        dispatch( ActionCreators.authenticationResponse.create( resp ) );
    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( e.toString() ) );
    }
  }
}