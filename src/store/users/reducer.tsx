import { ActionCreators, Action } from './actions';
import { ActionCreators as AdminActionCreators, Action as AdminAction } from '../admin-actions/actions';
import { IUserEntry, Page } from '../../../../../src';

// State
export type State = {
  readonly userPage: Page<IUserEntry<'client'>> | null;
  readonly busy: boolean;
};

export const initialState: State = {
  userPage: null,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action | AdminAction ): State {
  let partialState: Partial<State> | undefined;
  let page = state.userPage;

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

    case ActionCreators.UpdateUser.type:
      partialState = {
        busy: false,
        userPage: {
          ...page!,
          data: page!.data.map( ( item, index ) => {
            if ( item._id === action.payload._id )
              return action.payload;
            return item;
          } )
        }
      };
      break;

    case ActionCreators.RemoveUser.type:
      partialState = {
        userPage: { ...page!, data: page!.data.filter( user => user.username !== action.payload ) },
        busy: false
      };
      break;

    case AdminActionCreators.userActivated.type:
      partialState = {
        userPage: { ...page!, data: page!.data.map( user => { return { ...user, registerKey: '' } } ) }
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}