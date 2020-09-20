import { ActionCreator } from '../actions-creator';
import { IRootState } from '..';
import { AuthResponse, User, RegisterInput, LoginInput } from 'mantle';
import { push } from 'react-router-redux';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';
import { graphql } from '../../utils/httpClients';
import { LOGIN, LOGOUT, REGISTER } from '../../graphql/requests/auth-requests';

// Action Creators
export const ActionCreators = {
  setUser: new ActionCreator<'setUser', User | null>('setUser'),
  isAuthenticating: new ActionCreator<'isAuthenticating', boolean>('isAuthenticating'),
  authenticationError: new ActionCreator<'authenticationError', string>('authenticationError'),
  loggedOut: new ActionCreator<'loggedOut', boolean>('loggedOut'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  @dispatchError(ActionCreators.authenticationError)
  async login(authToken: LoginInput, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.isAuthenticating.create(true));
    const resp = await graphql<{ login: AuthResponse }>(LOGIN, { token: authToken });
    // const resp = await auth.login(authToken);
    dispatch!(ActionCreators.setUser.create(resp.login.user ? resp.login.user : null));
    dispatch!(push('/'));
  }

  @disptachable()
  @dispatchError(ActionCreators.authenticationError)
  async register(authToken: RegisterInput, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.isAuthenticating.create(true));
    const resp = await graphql<{ register: AuthResponse }>(REGISTER, { token: authToken });
    // const resp = await auth.register(authToken);
    dispatch!(ActionCreators.authenticationError.create(resp.register.message));
  }

  @disptachable()
  @dispatchError(ActionCreators.authenticationError)
  async logout(dispatch?: Function, getState?: () => IRootState) {
    await graphql<{ logout: AuthResponse }>(LOGOUT, {});
    // await auth.logout();
    dispatch!(ActionCreators.loggedOut.create(true));
    dispatch!(push('/login'));
  }
}

const actions: Actions = new Actions();
export default actions;
