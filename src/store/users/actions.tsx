import { ActionCreator } from '../actions-creator';
import { PaginatedUserResponse, User, UpdateUserInput, AddUserInput } from 'mantle';
import { IRootState } from '..';
import { ActionCreators as AppActionCreators } from '../app/actions';
import { ActionCreators as AppActions } from '../app/actions';
import { graphql } from '../../utils/httpClients';
import { CREATE_USER, REMOVE_USER, GET_USERS, PATCH_USER } from '../../graphql/requests/user-requests';

// Action Creators
export const ActionCreators = {
  SetUsersBusy: new ActionCreator<'users-busy', boolean>('users-busy'),
  SetUsers: new ActionCreator<'users-set-users', PaginatedUserResponse | null>('users-set-users'),
  UpdateUser: new ActionCreator<'users-update-user', User>('users-update-user'),
  RemoveUser: new ActionCreator<'users-remove-user', string>('users-remove-user'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

/**
 * Refreshes the user state
 */
export function getUsers(index: number = 0, search?: string) {
  return async function (dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.SetUsersBusy.create(true));
    const resp = await graphql<{ users: PaginatedUserResponse }>(GET_USERS, { index: index, search: search });
    // const resp = await getAll({ index: index, search: search });
    dispatch(ActionCreators.SetUsers.create(resp.users));
  };
}

export function update(id: string, token: Partial<UpdateUserInput>) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetUsersBusy.create(true));
      const resp = await graphql<{ updateUser: User }>(PATCH_USER, { token });
      // const resp = await updateUser(id, token);
      dispatch(ActionCreators.UpdateUser.create(resp.updateUser));
    } catch (err) {
      dispatch(ActionCreators.SetUsersBusy.create(false));
      dispatch(AppActions.serverResponse.create(err.message));
    }
  };
}

export function create(token: Partial<AddUserInput>, onComplete: () => void) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetUsersBusy.create(true));
      await graphql<{ addUser: User }>(CREATE_USER, { token });
      // await createUser(token);
      // const resp = await getAll({ index: 0, search: '' });
      const resp = await graphql<{ users: PaginatedUserResponse }>(GET_USERS, { index: 0, search: '' });
      dispatch(ActionCreators.SetUsers.create(resp.users));
      onComplete();
    } catch (err) {
      dispatch(ActionCreators.SetUsersBusy.create(false));
      dispatch(AppActions.serverResponse.create(err.message));
    }
  };
}

/**
 * Refreshes the user state
 */
export function removeUser(username: string) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetUsersBusy.create(true));
      // await remove(username);
      await graphql<{ removeUser: User }>(REMOVE_USER, { username });
      dispatch(ActionCreators.RemoveUser.create(username));
      dispatch(AppActionCreators.serverResponse.create(`User '${username}' successfully removed`));
    } catch {
      dispatch(ActionCreators.SetUsersBusy.create(true));
    }
  };
}
