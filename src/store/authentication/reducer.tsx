import { ActionCreators, Action } from './actions';
import { IUserEntry } from '../../../../../src';
import { ActionCreators as UserActions, Action as UserAction } from '../users/actions';

// State
export type State = {
  readonly busy: boolean;
  readonly authenticated: boolean;
  readonly error?: string | null;
  readonly user: IUserEntry<'client' | 'expanded'> | null;
};

export const initialState: State = {
  authenticated: false,
  busy: false,
  error: null,
  user: null
};

// Reducer
export default function reducer( state: State = initialState, action: Action | UserAction ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {

    case ActionCreators.isAuthenticating.type:
      partialState = {
        busy: true,
        error: null
      };
      break;

    case ActionCreators.setUser.type:
      partialState = {
        user: action.payload,
        authenticated: action.payload ? true : false,
        busy: false,
        error: null
      };
      break;

    case ActionCreators.authenticationError.type:
      partialState = {
        busy: false,
        authenticated: false,
        error: decodeURIComponent( action.payload )
      };
      break;

    case ActionCreators.loggedOut.type:
      partialState = {
        busy: false,
        authenticated: false,
        error: null
      };
      break;

    case UserActions.UpdateUser.type:
      partialState = {
        user: action.payload
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}