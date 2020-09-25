import { RedirectError } from '../../src/server/errors';
import { ActionCreators as CommentActions } from '../store/comments/actions';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import { CommentSortType, SortOrder, CommentVisibility, CommentsGetOptions } from '../../../../src/core/enums';
import { User } from 'mantle';
import controllerFactory from '../../../../src/core/controller-factory';
import { PaginatedCommentsResponse, Comment } from '../../../../src/graphql/models/comment-type';
import { graphql } from '../utils/nodeClients';
import { getCommentsQuery } from '../graphql/requests/comment-requests';
import { Request } from 'express';

export default async function (url: string, user: User | null, actions: Action[], request: Request, host: string) {
  const isAdmin = user && user.privileges !== 'regular' ? true : false;
  const matchesEdit = matchPath<any>(url, { path: '/dashboard/comments/edit/:id' });
  const initialFilter: Partial<CommentsGetOptions> = {
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
    const comment = await controllerFactory.get('comments').getOne(matchesEdit.params.id);
    actions.push(CommentActions.SetComment.create(Comment.fromEntity(comment)));
  } else {
    const page = await graphql<{ comments: PaginatedCommentsResponse }>(
      host,
      getCommentsQuery(5),
      initialFilter,
      request.headers
    );

    // let comments = await controllerFactory.get('comments').getAll(initialFilter);
    actions.push(
      CommentActions.SetComments.create({
        page: page.comments,
        filters: initialFilter,
      })
    );
  }
}
