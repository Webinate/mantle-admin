import { RedirectError } from './errors';
import { ActionCreators as PostActions } from '../store/posts/actions';
import { ActionCreators as CategoryActions } from '../store/categories/actions';
import { ActionCreators as CommentActions } from '../store/comments/actions';
import { IAuthReq } from '../../../../src';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import { controllers } from '../../../../src';

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
      controllers.categories.getAll( { expanded: true, depth: -1, root: true } ),
      controllers.comments.getAll( { expanded: true, depth: -1, index: 0 } )
    ] );

    actions.push( PostActions.SetPost.create( postReply[ 0 ] ) );
    actions.push( CategoryActions.SetCategories.create( postReply[ 1 ] ) );
    actions.push( CommentActions.SetComments.create( { page: postReply[ 2 ], filters: { index: 0, depth: -1, expanded: true, postId: matchesEdit.params.id } } ) );
  }
  else if ( matchesNew ) {
    let categories = await controllers.categories.getAll( { expanded: true, depth: -1, root: true } );
    actions.push( CategoryActions.SetCategories.create( categories ) );
  }
  else {
    let posts = await controllers.posts.getPosts( { public: isAdmin ? undefined : true, sort: 'modified', sortOrder: 'desc' } );
    actions.push( PostActions.SetPosts.create( { page: posts, filters: { index: 0, keyword: '' } } ) );
  }
}