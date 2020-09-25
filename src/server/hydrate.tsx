import { Action } from 'redux';
import { matchPath } from 'react-router';
import { ActionCreators } from '../store/authentication/actions';
import { ActionCreators as AppActions } from '../store/app/actions';
import { User } from 'mantle';
import postHandler from './posts';
import commentHandler from './comments';
import mediaHandler from './media';
import userHandler from './users';
import { Request } from 'express';

const yargs = require('yargs');
const args = yargs.argv;

/**
 * This decorator populates the application state with data before the client loads.
 * Each RouteAction will execute their actions if the url of the client matches
 * the path. This will in-turn hydrate the application state before its initial render
 */
export async function hydrate(url: string, user: User | null, request: Request, host: string) {
  const actions: Action[] = [];

  // Get the user
  actions.push(ActionCreators.setUser.create(user));

  // Get users if neccessary
  if (matchPath(url, { path: '/dashboard/users' })) await userHandler(actions);

  // Get posts if neccessary
  if (matchPath(url, { path: '/dashboard/posts' })) await postHandler(url, user, actions, request, host);

  // Get comments if neccessary
  if (matchPath(url, { path: '/dashboard/comments' })) await commentHandler(url, user, actions, request, host);

  // Get media if neccessary
  if (matchPath(url, { path: '/dashboard/media' })) await mediaHandler(url, user, actions);

  if (args.runningClientTests) actions.push(AppActions.setDebugMode.create(true));

  return actions;
}
