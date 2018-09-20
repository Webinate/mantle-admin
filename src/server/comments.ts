import { RedirectError } from 'modepress/clients/modepress-admin/src/server/errors';
import { ActionCreators as CommentActions } from 'modepress/clients/modepress-admin/src/store/comments/actions';
import { IAuthReq } from 'modepress';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import { controllers } from 'modepress';

export default async function( req: IAuthReq, actions: Action[] ) {
  const isAdmin = req._user && req._user.privileges < 2 ? true : false;
  const matchesEdit = matchPath<any>( req.url, { path: '/dashboard/comments/edit/:id' } );

  if ( !isAdmin ) {
    if ( matchesEdit )
      throw new RedirectError( '/dashboard/comments' );
  }

  if ( matchesEdit ) {
    const comment = await controllers.comments.getOne( matchesEdit.params.id, {} );
    actions.push( CommentActions.SetComment.create( comment ) );
  }
  else {
    let comments = await controllers.comments.getAll( { visibility: isAdmin ? 'all' : 'public', depth: -1, expanded: true } );
    actions.push( CommentActions.SetComments.create( { page: comments, filters: { index: 0, depth: -1, expanded: true } } ) );
  }
}