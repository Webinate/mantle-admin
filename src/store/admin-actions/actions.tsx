import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { ActionCreators as AppActionCreators } from '../app/actions';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';
import { graphql } from '../../utils/httpClients';
import { REQUEST_PASSWORD_RESET, APPROVE_ACTIVATION, RESEND_ACTIVATION } from '../../graphql/requests/auth-requests';

// Action Creators
export const ActionCreators = {
  busy: new ActionCreator<'admin-busy', boolean>('admin-busy'),
  userActivated: new ActionCreator<'admin-user-activated', string>('admin-user-activated'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  @dispatchError(AppActionCreators.serverResponse)
  async requestPasswordReset(username: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.busy.create(true));
    const resp = await graphql<boolean>(REQUEST_PASSWORD_RESET, { username });
    // const resp = await auth.requestPasswordReset(username);
    dispatch!(
      AppActionCreators.serverResponse.create(
        resp ? 'Password Reset has been sent' : 'Could not request password reset'
      )
    );
  }

  @disptachable()
  @dispatchError(AppActionCreators.serverResponse)
  async activate(username: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.busy.create(true));
    // await auth.approveActivation(username);
    await graphql<boolean>(APPROVE_ACTIVATION, { username });
    dispatch!(ActionCreators.userActivated.create(username));
    dispatch!(AppActionCreators.serverResponse.create('User successfully activated'));
  }

  @disptachable()
  @dispatchError(AppActionCreators.serverResponse)
  async resendActivation(username: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.busy.create(true));
    const resp = await graphql<boolean>(RESEND_ACTIVATION, { username });
    // const resp = await auth.resendActivation(username);
    dispatch!(ActionCreators.busy.create(false));
    dispatch!(
      AppActionCreators.serverResponse.create(resp ? 'Activation link sent to email' : 'Could not send activation link')
    );
  }
}

const actions: Actions = new Actions();
export default actions;
