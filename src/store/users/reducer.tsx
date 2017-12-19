import { ActionCreators, Action } from './actions';
import { ActionCreators as AdminActionCreators, Action as AdminAction } from '../admin-actions/actions';
import { UserTokens } from 'modepress';

// State
export type State = {
  readonly userPage: UserTokens.GetAll.Response | null | 'not-hydrated';
  readonly busy: boolean;
};

export const initialState: State = {
  userPage: 'not-hydrated',
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action | AdminAction ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetUsers.type:
      partialState = {
        userPage: action.payload,
        busy: false
      };
      break;

    case ActionCreators.SetUsersBusy.type:
      partialState = { busy: action.payload };
      break;

    case AdminActionCreators.userActivated.type:
      const page = state.userPage as UserTokens.GetAll.Response;
      partialState = {
        userPage: { ...page, data: page.data.map( user => { return { ...user, registerKey: '' } } ) }
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}