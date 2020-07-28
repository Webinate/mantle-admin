import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { ActionCreators as AppActionCreators } from '../app/actions';
import * as auth from '../../../../../src/lib-frontend/auth';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';

// Action Creators
export const ActionCreators = {
  busy: new ActionCreator<'admin-busy', boolean>('admin-busy'),
  userActivated: new ActionCreator<'admin-user-activated', string>('admin-user-activated')
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  @dispatchError(AppActionCreators.serverResponse)
  async requestPasswordReset(username: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.busy.create(true));
    const resp = await auth.requestPasswordReset(username);
    dispatch!(AppActionCreators.serverResponse.create(resp.message));
  }

  @disptachable()
  @dispatchError(AppActionCreators.serverResponse)
  async activate(username: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.busy.create(true));
    await auth.approveActivation(username);
    dispatch!(ActionCreators.userActivated.create(username));
    dispatch!(AppActionCreators.serverResponse.create('User successfully activated'));
  }

  @disptachable()
  @dispatchError(AppActionCreators.serverResponse)
  async resendActivation(username: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.busy.create(true));
    const resp = await auth.resendActivation(username);
    dispatch!(ActionCreators.busy.create(false));
    dispatch!(AppActionCreators.serverResponse.create(resp.message));
  }
}

const actions: Actions = new Actions();
export default actions;
