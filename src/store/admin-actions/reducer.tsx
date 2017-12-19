import { ActionCreators, Action } from './actions';

// State
export type State = {
  readonly busy: boolean;
  readonly response: string | null;
  readonly error?: string | null;
};

export const initialState: State = {
  busy: false,
  error: null,
  response: null
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {

    case ActionCreators.busy.type:
      partialState = {
        busy: action.payload
      };
      break;

    case ActionCreators.error.type:
      partialState = {
        error: action.payload
      };
      break;

    case ActionCreators.response.type:
      partialState = {
        response: action.payload
      };
      break;

    case ActionCreators.userActivated.type:
      partialState = {
        response: 'User successfully activated'
      };
      break;


    default: return state;
  }

  return { ...state, ...partialState } as State;
}