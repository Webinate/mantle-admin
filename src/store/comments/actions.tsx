import { ActionCreator } from '../actions-creator';
import { Comment, PaginatedCommentsResponse, AddCommentInput, Post, QueryCommentsArgs } from 'mantle';
import { UpdateCommentInput } from 'mantle';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';
import { graphql } from '../../utils/httpClients';
import {
  ADD_COMMENT,
  PATCH_COMMENT,
  getCommentsQuery,
  REMOVE_COMMENT,
  GET_POST_PREVIEW,
} from '../../graphql/requests/comment-requests';

// Action Creators
export const ActionCreators = {
  SetCommentsBusy: new ActionCreator<'comments-busy', boolean>('comments-busy'),
  SetComments: new ActionCreator<
    'comments-set-comments',
    { page: PaginatedCommentsResponse; filters: Partial<QueryCommentsArgs> }
  >('comments-set-comments'),
  SetComment: new ActionCreator<'comments-set-comment', Comment>('comments-set-comment'),
  SetCommentPostPreview: new ActionCreator<'set-comment-post-preview', Post | null>('set-comment-post-preview'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];
class Actions {
  /**
   * Gets all the comments
   */
  @disptachable()
  async getComments(options: Partial<QueryCommentsArgs>, dispatch?: Function, getState?: () => IRootState) {
    const state = getState!();
    const newFilters = { ...state.comments.commentFilters, ...options };

    // Resets the array first
    dispatch!(ActionCreators.SetCommentsBusy.create(true));

    // let resp: Page<IComment<'client' | 'expanded'>>;

    const resp = await graphql<{ comments: PaginatedCommentsResponse }>(getCommentsQuery(5), newFilters);
    // resp = await comments.getAll(newFilters);

    dispatch!(ActionCreators.SetComments.create({ page: resp.comments, filters: newFilters }));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async createComment(
    comment: Partial<AddCommentInput>,
    parent?: string,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetCommentsBusy.create(true));
    await graphql<{ addComment: Comment }>(ADD_COMMENT, { token: comment });
    // await comments.create(postId, comment, parent);
    dispatch!(this.getComments({}));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async editComment(token: Partial<UpdateCommentInput>, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetCommentsBusy.create(true));
    await graphql<{ patchComment: Comment }>(PATCH_COMMENT, { token: token });
    // await comments.update(commentId, token);
    dispatch!(this.getComments({}));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async getPostPreview(postId: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetCommentPostPreview.create(null));
    const resp = await graphql<{ post: Post }>(GET_POST_PREVIEW, { id: postId });
    dispatch!(ActionCreators.SetCommentPostPreview.create(resp.post));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async deleteComment(commentId: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetCommentsBusy.create(true));
    await graphql<{ removeComment: Comment }>(REMOVE_COMMENT, { id: commentId });
    // await comments.remove(commentId);
    dispatch!(this.getComments({}));
  }
}

const actions: Actions = new Actions();
export default actions;
