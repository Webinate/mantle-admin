import { ActionCreators, Action } from './actions';
import { Page, IPost } from 'modepress';

// State
export type State = {
  readonly postPage: Page<IPost> | null;
  readonly busy: boolean;
  readonly prepopulated: boolean;
};

export const initialState: State = {
  postPage: null,
  busy: false,
  prepopulated: false
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

    case ActionCreators.SetPrepopulated.type:
      partialState = { prepopulated: action.payload };
      break;

    case ActionCreators.SetPostsBusy.type:
      partialState = { busy: action.payload };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}