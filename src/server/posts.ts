import { RedirectError } from './errors';
import { ActionCreators as PostActions } from '../store/posts/actions';
import { ActionCreators as CategoryActions } from '../store/categories/actions';
import { IAuthReq } from 'modepress';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import { controllers } from 'modepress';

export default async function( req: IAuthReq, actions: Action[] ) {
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