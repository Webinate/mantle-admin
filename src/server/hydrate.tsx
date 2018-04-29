import { Action } from 'redux';
import { matchPath, match } from 'react-router';
import { ActionCreators } from '../store/authentication/actions';
import { ActionCreators as UserActions } from '../store/users/actions';
import { ActionCreators as PostActions } from '../store/posts/actions';
import { ActionCreators as CategoryActions } from '../store/categories/actions';
import { ActionCreators as AppActions } from '../store/app/actions';
import { IAuthReq } from 'modepress';
import { controllers } from 'modepress';
const yargs = require( 'yargs' );
const args = yargs.argv;

/**
 * This decorator populates the application state with data before the client loads.
 * Each RouteAction will execute their actions if the url of the client matches
 * the path. This will in-turn hydrate the application state before its initial render
 */
export async function hydrate( req: IAuthReq ) {
  const actions: Action[] = [];
  let matches: match<any> | null;

  // Get the user
  actions.push( ActionCreators.setUser.create( req._user ) );

  // Get users if neccessary
  matches = matchPath( req.url, { path: '/dashboard/users' } );

  if ( matches ) {
    const users = await controllers.users.getUsers( 0, 10 );
    actions.push( UserActions.SetUsers.create( users ) );
  }

  // Get posts if neccessary
  matches = matchPath( req.url, { path: '/dashboard/posts' } );

  if ( matches ) {
    matches = matchPath( req.url, { path: '/dashboard/posts/edit/:id' } );
    if ( matches ) {
      const post = await controllers.posts.getPost( { id: matches.params.id } );
      const categories = await controllers.categories.getAll( { expanded: true, depth: -1, root: true } );
      actions.push( PostActions.SetPost.create( post ) );
      actions.push( CategoryActions.SetCategories.create( categories ) );
    }
    else {
      const posts = await controllers.posts.getPosts();
      actions.push( PostActions.SetPosts.create( posts ) );
    }
  }

  if ( args.runningTests )
    actions.push( AppActions.setDebugMode.create( true ) );

  return actions;
}