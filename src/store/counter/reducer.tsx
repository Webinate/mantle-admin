import { ActionCreators, Action } from './actions';

export type ViewerMode = 'infinite' | 'paged';

// State
export type State = {
  readonly count: number;
  readonly busy: boolean;
};

export const initialState: State = {
  count: 0,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetCount.type:
      partialState = {
        count: action.payload
      };
      break;

    case ActionCreators.IsBusy.type:
      partialState = { busy: action.payload };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}