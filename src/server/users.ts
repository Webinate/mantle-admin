import { Action } from 'redux';
import { controllers } from '../../../../src';
import { ActionCreators as UserActions } from '../store/users/actions';

export default async function(actions: Action[]) {
  const users = await controllers.users.getUsers({ index: 0, limit: 10 });
  actions.push(UserActions.SetUsers.create(users));
}
