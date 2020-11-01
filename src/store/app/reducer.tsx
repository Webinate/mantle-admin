import { ActionCreators, Action } from './actions';

// State
export type State = {
  readonly response: string | null;
  readonly debugMode: boolean;
  readonly appHasHistory: boolean;
  readonly numLocationChanges: number;
};

export const initialState: State = {
  response: null,
  debugMode: false,
  numLocationChanges: 0,
  appHasHistory: false,
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.routerLoactionChanged.type:
      partialState = {
        numLocationChanges: state.numLocationChanges + 1,
        appHasHistory: !state.numLocationChanges ? false : true,
      };
      break;

    case ActionCreators.serverResponse.type:
      partialState = {
        response: action.payload ? decodeURIComponent(action.payload) : null,
      };
      break;

    case ActionCreators.setDebugMode.type:
      partialState = {
        debugMode: action.payload,
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
