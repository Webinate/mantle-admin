import { ActionCreators, Action } from './actions';
import { Page, IPost } from 'modepress';

// State
export type State = {
  readonly postPage: Page<IPost> | null;
  readonly post: IPost | null;
  readonly busy: boolean;
};

export const initialState: State = {
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
        postPage: action.payload,
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