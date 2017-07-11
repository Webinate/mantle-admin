import { ActionCreator } from '../actions-creator';

// Action Creators
export const ActionCreators = {
  IsAuthenticated: new ActionCreator<'IsAuthenticated', boolean>( 'IsAuthenticated' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];