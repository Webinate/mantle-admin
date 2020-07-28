import { RedirectError } from '../../src/server/errors';
import { ActionCreators as CommentActions } from '../store/comments/actions';
import { IAuthReq, CommentGetAllOptions } from 'mantle';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import { controllers } from 'mantle';
import { CommentSortType, SortOrder, CommentVisibility } from '../../../../src/core/enums';

export default async function (req: IAuthReq, actions: Action[]) {
  const isAdmin = req._user && req._user.privileges !== 'regular' ? true : false;
  const matchesEdit = matchPath<any>(req.url, { path: '/dashboard/comments/edit/:id' });
  const initialFilter: Partial<CommentGetAllOptions> = {
    visibility: isAdmin ? CommentVisibility.all : CommentVisibility.public,
    index: 0,
    depth: -1,
    expanded: true,
    sortType: CommentSortType.updated,
    sortOrder: SortOrder.desc,
    root: true,
  };

  if (!isAdmin) {
    if (matchesEdit) throw new RedirectError('/dashboard/comments');
  }

  if (matchesEdit) {
    const comment = await controllers.comments.getOne(matchesEdit.params.id, {});
    actions.push(CommentActions.SetComment.create(comment));
  } else {
    let comments = await controllers.comments.getAll(initialFilter);
    actions.push(CommentActions.SetComments.create({ page: comments, filters: initialFilter }));
  }
}
