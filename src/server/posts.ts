import { User } from 'mantle';
import { RedirectError } from './errors';
import { ActionCreators as PostActions } from '../store/posts/actions';
import { ActionCreators as CategoryActions } from '../store/categories/actions';
import { ActionCreators as TemplatesActions } from '../store/templates/actions';
import { ActionCreators as CommentActions } from '../store/comments/actions';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import {
  PostSortType,
  PostVisibility,
  SortOrder,
  CategoriesGetOptions,
  PostsGetOptions,
  CommentsGetOptions,
} from '../../../../src/core/enums';
import ControllerFactory from '../../../../src/core/controller-factory';
import { PaginatedCategoryResponse } from '../../../../src/graphql/models/category-type';
import { PaginatedCommentsResponse } from '../../../../src/graphql/models/comment-type';
import { PaginatedTemplateResponse } from '../../../../src/graphql/models/template-type';
import { PaginatedPostsResponse } from '../../../../src/graphql/models/post-type';
import { Post } from '../../../../src/graphql/models/post-type';
import { graphql } from '../utils/nodeClients';
import { GET_POST } from '../graphql/requests/post-requests';
import { Request } from 'express';

export default async function (url: string, user: User | null, actions: Action[], request: Request, host: string) {
  const isAdmin = user && user.privileges !== 'regular' ? true : false;
  const matchesEdit = matchPath<any>(url, { path: '/dashboard/posts/edit/:id' });
  const initialCategoryFilter: Partial<CategoriesGetOptions> = {
    root: true,
  };
  const initialPostsFilter: Partial<PostsGetOptions> = {
    visibility: isAdmin ? PostVisibility.all : PostVisibility.public,
    sort: PostSortType.modified,
    sortOrder: SortOrder.desc,
  };
  const initialCommentFilter: Partial<CommentsGetOptions> = {
    expanded: true,
    depth: 5,
    index: 0,
    postId: matchesEdit ? matchesEdit.params.id : undefined,
  };

  if (matchesEdit) {
    try {
      const postReply = await Promise.all([
        graphql<{ post: Post }>(host, GET_POST, { id: matchesEdit.params.id }, request.headers),
        // ControllerFactory.get('posts').getPost({ id: matchesEdit.params.id }),
        ControllerFactory.get('categories').getAll(initialCategoryFilter),
        ControllerFactory.get('comments').getAll(initialCommentFilter),
        ControllerFactory.get('templates').getMany(),
      ]);

      const post = postReply[0].post;

      if (!isAdmin && !post.public) throw new RedirectError('/dashboard/posts');

      actions.push(PostActions.SetPost.create(post));
      actions.push(CategoryActions.SetCategories.create(PaginatedCategoryResponse.fromEntity(postReply[1])));
      actions.push(
        CommentActions.SetComments.create({
          page: PaginatedCommentsResponse.fromEntity(postReply[2]),
          filters: initialCommentFilter,
        })
      );
      actions.push(TemplatesActions.GetAll.create(PaginatedTemplateResponse.fromEntity(postReply[3])));
    } catch (err) {
      throw new RedirectError('/dashboard/posts');
    }
  } else {
    let posts = await ControllerFactory.get('posts').getPosts(initialPostsFilter);
    actions.push(
      PostActions.SetPosts.create({ page: PaginatedPostsResponse.fromEntity(posts), filters: initialPostsFilter })
    );
  }
}
