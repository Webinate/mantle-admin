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

  const matchesNew = matchPath<any>( req.url, { path: '/dashboard/posts/new' } );
  const matchesEdit = matchPath<any>( req.url, { path: '/dashboard/posts/edit/:id' } );

  if ( !isAdmin ) {
    if ( matchesNew || matchesEdit )
      throw new RedirectError( '/dashboard/posts' );
  }


  if ( matchesEdit ) {
    const postReply = await Promise.all( [
      controllers.posts.getPost( { id: matchesEdit.params.id } ),
      controllers.categories.getAll( { expanded: true, depth: -1, root: true } )
    ] );

    actions.push( PostActions.SetPost.create( postReply[ 0 ] ) );
    actions.push( CategoryActions.SetCategories.create( postReply[ 1 ] ) );
  }
  else if ( matchesNew ) {
    let categories = await controllers.categories.getAll( { expanded: true, depth: -1, root: true } );
    actions.push( CategoryActions.SetCategories.create( categories ) );
  }
  else {
    let posts = await controllers.posts.getPosts( { public: isAdmin ? undefined : true } );
    actions.push( PostActions.SetPosts.create( { page: posts, filters: { index: 0, keyword: '' } } ) );
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