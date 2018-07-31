import { Action } from 'redux';
import { matchPath } from 'react-router';
import { ActionCreators } from '../store/authentication/actions';
import { ActionCreators as AppActions } from '../store/app/actions';
import { IAuthReq, IUserEntry } from '../../../../src';
import postHandler from './posts';
import mediaHandler from './media';
import userHandler from './users';

const yargs = require( 'yargs' );
const args = yargs.argv;

/**
 * This decorator populates the application state with data before the client loads.
 * Each RouteAction will execute their actions if the url of the client matches
 * the path. This will in-turn hydrate the application state before its initial render
 */
export async function hydrate( req: IAuthReq ) {
  const actions: Action[] = [];

  // Get the user
  actions.push( ActionCreators.setUser.create( req._user as any as IUserEntry<'client'> ) );

  // Get users if neccessary
  if ( matchPath( req.url, { path: '/dashboard/users' } ) )
    await userHandler( actions );

  // Get posts if neccessary
  if ( matchPath( req.url, { path: '/dashboard/posts' } ) )
    await postHandler( req, actions );

  // Get media if neccessary
  if ( matchPath( req.url, { path: '/dashboard/media' } ) )
    await mediaHandler( req, actions );

  if ( args.runningTests )
    actions.push( AppActions.setDebugMode.create( true ) );

  return actions;
}
