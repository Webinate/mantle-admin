import { ActionCreator } from '../actions-creator';
import { IRootState } from '../';
import { ClientError } from '../../utils/httpClients';
import { IUserEntry, ILoginToken, IRegisterToken } from 'modepress';
import { login as loginApi, register as registerApi, logout as logoutApi } from 'modepress/src/lib-frontend/auth';
import { push } from 'react-router-redux';

// Action Creators
export const ActionCreators = {
  setUser: new ActionCreator<'setUser', IUserEntry<'client'> | null>( 'setUser' ),
  isAuthenticating: new ActionCreator<'isAuthenticating', boolean>( 'isAuthenticating' ),
  authenticationError: new ActionCreator<'authenticationError', string>( 'authenticationError' ),
  loggedOut: new ActionCreator<'loggedOut', boolean>( 'loggedOut' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];


export function login( authToken: ILoginToken ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.isAuthenticating.create( true ) );

    try {
      const resp = await loginApi( authToken );
      dispatch( ActionCreators.setUser.create( resp.user ? resp.user : null ) );
      dispatch( push( '/' ) );

    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( ( e as ClientError ).response.statusText ) );
    }
  }
}

export function register( authToken: IRegisterToken ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.isAuthenticating.create( true ) );

    try {
      const resp = await registerApi( authToken );
      dispatch( ActionCreators.authenticationError.create( resp.message ) );
    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( ( e as ClientError ).response.statusText ) );
    }
  }
}

export function logout() {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      await logoutApi();
      dispatch( ActionCreators.loggedOut.create( true ) );
      dispatch( push( '/login' ) );

    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( ( e as ClientError ).response.statusText ) );
    }
  }
}