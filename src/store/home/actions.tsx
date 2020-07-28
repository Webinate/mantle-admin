import { ActionCreator } from '../actions-creator';
import { IPost } from '../../../../../src';
import * as posts from '../../../../../src/lib-frontend/posts';
import { IRootState } from '..';
import { disptachable } from '../../decorators/dispatchable';
import { SortOrder, PostSortType } from '../../../../../src/core/enums';

// Action Creators
export const ActionCreators = {
  SetPostsBusy: new ActionCreator<'home-busy', boolean>('home-busy'),
  SetPost: new ActionCreator<
    'home-set-home-data',
    {
      post: IPost<'expanded'>;
      posts: IPost<'expanded'>[];
    } | null
  >('home-set-home-data'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  async getHomeElements(dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetPostsBusy.create(true));
    const [postsByCreationDate, postsByModifiedDate] = await Promise.all([
      posts.getAll({ sort: PostSortType.created, sortOrder: SortOrder.desc, limit: 5 }),
      posts.getAll({ sort: PostSortType.modified, sortOrder: SortOrder.desc, limit: 5 }),
    ]);

    if (postsByCreationDate.data.length > 0) {
      const latestPost = await posts.getOne({ id: postsByCreationDate.data[0]._id });

      dispatch!(
        ActionCreators.SetPost.create({
          post: latestPost as IPost<'expanded'>,
          posts: postsByModifiedDate.data as IPost<'expanded'>[],
        })
      );
    } else dispatch!(ActionCreators.SetPost.create(null));
  }
}
const actions: Actions = new Actions();
export default actions;
