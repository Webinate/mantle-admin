import { Action } from 'redux';
import { matchPath } from 'react-router';
import { ActionCreators } from '../store/authentication/actions';
import { ActionCreators as AppActions } from '../store/app/actions';
import { IAuthReq, IUserEntry } from '../../../../src';
import postHandler from './posts';
import commentHandler from './comments';
import mediaHandler from './media';
import userHandler from './users';
import { controllers } from 'mantle';

const yargs = require( 'yargs' );
const args = yargs.argv;

/**
 * This decorator populates the application state with data before the client loads.
 * Each RouteAction will execute their actions if the url of the client matches
 * the path. This will in-turn hydrate the application state before its initial render
 */
export async function hydrate( req: IAuthReq ) {
  const actions: Action[] = [];

  let user: IUserEntry<'expanded'> | null = null;

  if ( req._user )
    user = await controllers.users.getUser( { id: req._user._id.toString() } ) as IUserEntry<'expanded'>;

  // Get the user
  actions.push( ActionCreators.setUser.create( user ) );

  // Get users if neccessary
  if ( matchPath( req.url, { path: '/dashboard/users' } ) )
    await userHandler( actions );

  // Get posts if neccessary
  if ( matchPath( req.url, { path: '/dashboard/posts' } ) )
    await postHandler( req, actions );

  // Get comments if neccessary
  if ( matchPath( req.url, { path: '/dashboard/comments' } ) )
    await commentHandler( req, actions );

  // Get media if neccessary
  if ( matchPath( req.url, { path: '/dashboard/media' } ) )
    await mediaHandler( req, actions );

  if ( args.runningClientTests )
    actions.push( AppActions.setDebugMode.create( true ) );

  return actions;
}
