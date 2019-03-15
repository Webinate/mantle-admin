import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';

// Action Creators
export const ActionCreators = {
  serverResponse: new ActionCreator<'app-responses-message', string | null>('app-responses-message'),
  setDebugMode: new ActionCreator<'app-debug-mode', boolean>('app-debug-mode')
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

export function messageUser(message: string) {
  return async function(dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.serverResponse.create(message));
  };
}

export function setDebugMode(enabled: boolean) {
  return async function(dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.setDebugMode.create(enabled));
  };
}
