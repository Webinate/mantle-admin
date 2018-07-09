import { ActionCreators, Action } from './actions';
import * as posts from '../../../../../src/lib-frontend/posts';
import { Page, IPost } from 'modepress';

// State
export type State = {
  readonly postFilters: Partial<posts.GetAllOptions> | null;
  readonly postPage: Page<IPost<'client'>> | null;
  readonly post: IPost<'client'> | null;
  readonly busy: boolean;
};

export const initialState: State = {
  postFilters: null,
  postPage: null,
  post: null,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetPosts.type:
      partialState = {
        postPage: action.payload.page,
        postFilters: action.payload.filters,
        busy: false
      };
      break;

    case ActionCreators.SetPostsBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetPost.type:
      partialState = {
        post: action.payload,
        busy: false
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}