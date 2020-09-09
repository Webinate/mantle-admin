import { Action } from 'redux';
import { ActionCreators as UserActions } from '../store/users/actions';
import controllerFactory from '../../../../src/core/controller-factory';
import { PaginatedUserResponse } from '../../../../src/graphql/models/user-type';

export default async function (actions: Action[]) {
  const users = await controllerFactory.get('users').getUsers({ index: 0, limit: 10 });
  actions.push(UserActions.SetUsers.create(PaginatedUserResponse.fromEntity(users) as PaginatedUserResponse));
}
