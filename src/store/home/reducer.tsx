import { ActionCreators, Action } from './actions';
import { Post } from 'mantle';

// State
export type State = {
  readonly latestPost: Post | null;
  readonly posts: Post[];
  readonly busy: boolean;
};

export const initialState: State = {
  latestPost: null,
  posts: [],
  busy: false,
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.SetPostsBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetPost.type:
      partialState = {
        latestPost: action.payload ? action.payload.post : null,
        posts: action.payload ? action.payload.posts : [],
        busy: false,
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
