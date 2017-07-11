import { ActionCreators, Action } from './actions';

// State
export type State = {
  readonly authenticated: boolean;
};

export const initialState: State = {
  authenticated: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {

    case ActionCreators.IsAuthenticated.type:
      partialState = { authenticated: action.payload };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}