import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { disptachable } from '../../decorators/dispatchable';

// Action Creators
export const ActionCreators = {
  serverResponse: new ActionCreator<'app-responses-message', string | null>('app-responses-message'),
  setDebugMode: new ActionCreator<'app-debug-mode', boolean>('app-debug-mode')
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  async messageUser(message: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.serverResponse.create(message));
  }

  @disptachable()
  async setDebugMode(enabled: boolean, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.setDebugMode.create(enabled));
  }
}

const actions: Actions = new Actions();
export default actions;
