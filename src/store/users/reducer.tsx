import { ActionCreators, Action } from './actions';
import { IUserEntry } from 'modepress';

// State
export type State = {
  readonly users: IUserEntry[] | null;
  readonly busy: boolean;
};

export const initialState: State = {
  users: null,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetUsers.type:
      partialState = {
        users: action.payload,
        busy: false
      };
      break;

    case ActionCreators.SetUsersBusy.type:
      partialState = { busy: action.payload };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}