import { ActionCreator } from '../actions-creator';
import { IRootState } from '../';

// Action Creators
export const ActionCreators = {
  serverResponse: new ActionCreator<'server-responses-message', string>( 'server-responses-message' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function messageUser( message: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.serverResponse.create( message ) );
  }
}