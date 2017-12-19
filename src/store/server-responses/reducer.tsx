import { ActionCreators, Action } from './actions';

// State
export type State = {
  readonly response: string | null;
};

export const initialState: State = {
  response: null
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {

    case ActionCreators.serverResponse.type:
      partialState = {
        response: action.payload
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}