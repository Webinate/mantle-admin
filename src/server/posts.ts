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

export default async function (url: string, user: User | null, actions: Action[]) {
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
    const postReply = await Promise.all([
      ControllerFactory.get('posts').getPost({ id: matchesEdit.params.id }),
      ControllerFactory.get('categories').getAll(initialCategoryFilter),
      ControllerFactory.get('comments').getAll(initialCommentFilter),
      ControllerFactory.get('templates').getMany(),
    ]);

    const post = postReply[0];

    if (!isAdmin && !post.public) throw new RedirectError('/dashboard/posts');

    actions.push(PostActions.SetPost.create(Post.fromEntity(post)));
    actions.push(CategoryActions.SetCategories.create(PaginatedCategoryResponse.fromEntity(postReply[1])));
    actions.push(
      CommentActions.SetComments.create({
        page: PaginatedCommentsResponse.fromEntity(postReply[2]),
        filters: initialCommentFilter,
      })
    );
    actions.push(TemplatesActions.GetAll.create(PaginatedTemplateResponse.fromEntity(postReply[3])));
  } else {
    let posts = await ControllerFactory.get('posts').getPosts(initialPostsFilter);
    actions.push(
      PostActions.SetPosts.create({ page: PaginatedPostsResponse.fromEntity(posts), filters: initialPostsFilter })
    );
  }
}
