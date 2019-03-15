import { ActionCreators, Action } from './actions';

// State
export type State = {
  readonly busy: boolean;
};

export const initialState: State = {
  busy: false
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.busy.type:
      partialState = {
        busy: action.payload
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
