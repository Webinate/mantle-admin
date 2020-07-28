import { ActionCreator } from '../actions-creator';
import { Page, IComment } from '../../../../../src';
import { CommentGetAllOptions } from 'mantle';
import * as comments from '../../../../../src/lib-frontend/comments';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';

// Action Creators
export const ActionCreators = {
  SetCommentsBusy: new ActionCreator<'comments-busy', boolean>('comments-busy'),
  SetComments: new ActionCreator<
    'comments-set-comments',
    { page: Page<IComment<'client' | 'expanded'>>; filters: Partial<CommentGetAllOptions> }
  >('comments-set-comments'),
  SetComment: new ActionCreator<'comments-set-comment', IComment<'client' | 'expanded'>>('comments-set-comment')
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];
class Actions {
  /**
   * Gets all the comments
   */
  @disptachable()
  async getComments(
    options: Partial<CommentGetAllOptions>,
    postId?: string,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    const state = getState!();
    const newFilters = { ...state.comments.commentFilters, ...options };

    // Resets the array first
    dispatch!(ActionCreators.SetCommentsBusy.create(true));

    let resp: Page<IComment<'client' | 'expanded'>>;

    resp = await comments.getAll(newFilters);

    dispatch!(ActionCreators.SetComments.create({ page: resp, filters: newFilters }));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async createComment(
    postId: string,
    comment: Partial<IComment<'client'>>,
    parent?: string,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetCommentsBusy.create(true));
    await comments.create(postId, comment, parent);
    dispatch!(this.getComments({}));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async editComment(
    commentId: string,
    token: Partial<IComment<'client'>>,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetCommentsBusy.create(true));
    await comments.update(commentId, token);
    dispatch!(this.getComments({}));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async deleteComment(commentId: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetCommentsBusy.create(true));
    await comments.remove(commentId);
    dispatch!(this.getComments({}));
  }
}

const actions: Actions = new Actions();
export default actions;
