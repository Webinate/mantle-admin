import { ActionCreators, Action } from './actions';

// State
export type State = {
  readonly busy: boolean;
  readonly authenticated: boolean;
  readonly error?: string | null;
};

export const initialState: State = {
  authenticated: false,
  busy: false,
  error: null
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {

    case ActionCreators.isAuthenticating.type:
      partialState = {
        busy: true,
        error: null
      };
      break;

    case ActionCreators.authenticationResponse.type:
      partialState = {
        authenticated: true,
        error: null
      };
      break;
    case ActionCreators.authenticationError.type:
      partialState = {
        authenticated: false,
        error: action.payload
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}