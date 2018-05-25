import { Action } from 'redux';
import { matchPath } from 'react-router';
import { ActionCreators } from '../store/authentication/actions';
import { ActionCreators as UserActions } from '../store/users/actions';
import { ActionCreators as PostActions } from '../store/posts/actions';
import { ActionCreators as CategoryActions } from '../store/categories/actions';
import { ActionCreators as AppActions } from '../store/app/actions';
import { RedirectError } from './errors';
import { IAuthReq, IUserEntry } from 'modepress';
import { controllers } from 'modepress';
const yargs = require( 'yargs' );
const args = yargs.argv;

async function handleUserScreen( actions: Action[] ) {
  const users = await controllers.users.getUsers( 0, 10 );
  actions.push( UserActions.SetUsers.create( users ) );
}

async function handlePostScreen( req: IAuthReq, actions: Action[] ) {

  const isAdmin = req._user && req._user.privileges < 2 ? true : false;

  if ( !isAdmin ) {
    if (
      matchPath( req.url, { path: '/dashboard/posts/new' } ) ||
      matchPath( req.url, { path: '/dashboard/posts/edit/:id' } )
    )
      throw new RedirectError( '/dashboard/posts' );
  }

  let matches = matchPath<any>( req.url, { path: '/dashboard/posts/edit/:id' } );
  if ( matches ) {
    const postReply = await Promise.all( [
      controllers.posts.getPost( { id: matches.params.id } ),
      controllers.categories.getAll( { expanded: true, depth: -1, root: true } )
    ] );

    actions.push( PostActions.SetPost.create( postReply[ 0 ] ) );
    actions.push( CategoryActions.SetCategories.create( postReply[ 1 ] ) );
  }
  else {
    let posts = await controllers.posts.getPosts( { public: isAdmin ? undefined : true } );
    actions.push( PostActions.SetPosts.create( posts ) );
  }
}

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
    await handleUserScreen( actions );

  // Get posts if neccessary
  if ( matchPath( req.url, { path: '/dashboard/posts' } ) )
    await handlePostScreen( req, actions );

  if ( args.runningTests )
    actions.push( AppActions.setDebugMode.create( true ) );

  return actions;
}