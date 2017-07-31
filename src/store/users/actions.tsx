import { ActionCreator } from '../actions-creator';
import { IUserEntry } from 'modepress';

// Action Creators
export const ActionCreators = {
  SetUsersBusy: new ActionCreator<'SetUsersBusy', boolean>( 'SetUsersBusy' ),
  SetUsers: new ActionCreator<'SetUsers', IUserEntry[] | null>( 'SetUsers' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];