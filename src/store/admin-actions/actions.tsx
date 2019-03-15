import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { ClientError } from '../../utils/httpClients';
import { ActionCreators as AppActionCreators } from '../app/actions';
import * as auth from '../../../../../src/lib-frontend/auth';

// Action Creators
export const ActionCreators = {
  busy: new ActionCreator<'admin-busy', boolean>('admin-busy'),
  userActivated: new ActionCreator<'admin-user-activated', string>('admin-user-activated')
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

export function requestPasswordReset(username: string) {
  return async function(dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.busy.create(true));

    try {
      const resp = await auth.requestPasswordReset(username);
      dispatch(AppActionCreators.serverResponse.create(resp.message));
    } catch (e) {
      dispatch(AppActionCreators.serverResponse.create((e as ClientError).response.statusText));
    }
  };
}

export function activate(username: string) {
  return async function(dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.busy.create(true));

    try {
      await auth.approveActivation(username);
      dispatch(ActionCreators.userActivated.create(username));
      dispatch(AppActionCreators.serverResponse.create('User successfully activated'));
    } catch (e) {
      dispatch(AppActionCreators.serverResponse.create((e as ClientError).response.statusText));
    }
  };
}

export function resendActivation(username: string) {
  return async function(dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.busy.create(true));

    try {
      const resp = await auth.resendActivation(username);
      dispatch(ActionCreators.busy.create(false));
      dispatch(AppActionCreators.serverResponse.create(resp.message));
    } catch (e) {
      dispatch(AppActionCreators.serverResponse.create((e as ClientError).response.statusText));
    }
  };
}
