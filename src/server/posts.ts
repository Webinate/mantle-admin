import { PostsGetAllOptions, CommentGetAllOptions, CategoriesGetManyOptions, IPost } from 'mantle';
import { RedirectError } from './errors';
import { ActionCreators as PostActions } from '../store/posts/actions';
import { ActionCreators as CategoryActions } from '../store/categories/actions';
import { ActionCreators as TemplatesActions } from '../store/templates/actions';
import { ActionCreators as CommentActions } from '../store/comments/actions';
import { IAuthReq } from '../../../../src';
import { Action } from 'redux';
import { matchPath } from 'react-router';
import { controllers } from '../../../../src';

export default async function(req: IAuthReq, actions: Action[]) {
  const isAdmin = req._user && req._user.privileges !== 'regular' ? true : false;
  const matchesEdit = matchPath<any>(req.url, { path: '/dashboard/posts/edit/:id' });
  const initialCategoryFilter: Partial<CategoriesGetManyOptions> = {
    expanded: true,
    depth: -1,
    root: true
  };
  const initialPostsFilter: Partial<PostsGetAllOptions> = {
    visibility: isAdmin ? 'all' : 'public',
    sort: 'modified',
    sortOrder: 'desc'
  };
  const initialCommentFilter: Partial<CommentGetAllOptions> = {
    expanded: true,
    depth: 5,
    index: 0,
    postId: matchesEdit ? matchesEdit.params.id : undefined
  };

  if (matchesEdit) {
    const postReply = await Promise.all([
      controllers.posts.getPost({ id: matchesEdit.params.id }),
      controllers.categories.getAll(initialCategoryFilter),
      controllers.comments.getAll(initialCommentFilter),
      controllers.templates.getMany()
    ]);

    const post = postReply[0];

    if (!isAdmin && !post.public) throw new RedirectError('/dashboard/posts');

    actions.push(PostActions.SetPost.create(post as IPost<'expanded'>));
    actions.push(CategoryActions.SetCategories.create(postReply[1]));
    actions.push(CommentActions.SetComments.create({ page: postReply[2], filters: initialCommentFilter }));
    actions.push(TemplatesActions.GetAll.create(postReply[3]));
  } else {
    let posts = await controllers.posts.getPosts(initialPostsFilter);
    actions.push(PostActions.SetPosts.create({ page: posts, filters: initialPostsFilter }));
  }
}
