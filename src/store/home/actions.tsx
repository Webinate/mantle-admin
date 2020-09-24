import { ActionCreator } from '../actions-creator';
import { Post, PaginatedPostsResponse } from 'mantle';
import { IRootState } from '..';
import { disptachable } from '../../decorators/dispatchable';
import { graphql } from '../../utils/httpClients';
import { GET_POST, GET_POSTS } from '../../graphql/requests/post-requests';
import { dispatchError } from '../../decorators/dispatchError';
import { ActionCreators as AppActions } from '../app/actions';

// Action Creators
export const ActionCreators = {
  SetPostsBusy: new ActionCreator<'home-busy', boolean>('home-busy'),
  SetPost: new ActionCreator<
    'home-set-home-data',
    {
      post: Post;
      posts: Post[];
    } | null
  >('home-set-home-data'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  @dispatchError(AppActions.serverResponse, { prefix: 'Error: ' })
  async getHomeElements(dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetPostsBusy.create(true));
    // const [postsByCreationDate, postsByModifiedDate] = await Promise.all([
    //   posts.getAll({ sort: PostSortType.created, sortOrder: SortOrder.desc, limit: 5 }),
    //   posts.getAll({ sort: PostSortType.modified, sortOrder: SortOrder.desc, limit: 5 }),
    // ]);

    const [postsByCreationDate, postsByModifiedDate] = await Promise.all([
      graphql<{ posts: PaginatedPostsResponse }>(GET_POSTS, { sort: 'created', sortOrder: 'desc', limit: 5 }),
      graphql<{ posts: PaginatedPostsResponse }>(GET_POSTS, { sort: 'modified', sortOrder: 'desc', limit: 5 }),
    ]);

    if (postsByCreationDate.posts.data.length > 0) {
      const latestPost = await graphql<{ post: Post }>(GET_POST, { id: postsByCreationDate.posts.data[0]._id });
      // const latestPost = await posts.getOne({ id: postsByCreationDate.data[0]._id });

      dispatch!(
        ActionCreators.SetPost.create({
          post: latestPost.post,
          posts: postsByModifiedDate.posts.data,
        })
      );
    } else dispatch!(ActionCreators.SetPost.create(null));
  }
}
const actions: Actions = new Actions();
export default actions;
