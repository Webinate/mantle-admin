import { ActionCreators, Action } from './actions';
import { CommentGetAllOptions } from 'modepress';
import { Page, IComment } from '../../../../../src';

// State
export type State = {
  readonly commentFilters: Partial<CommentGetAllOptions> | null;
  readonly commentPage: Page<IComment<'client'>> | null;
  readonly comment: IComment<'client'> | null;
  readonly busy: boolean;
};

export const initialState: State = {
  commentFilters: null,
  commentPage: null,
  comment: null,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetCommentsBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetComments.type:
      partialState = {
        busy: false,
        commentPage: action.payload.page,
        commentFilters: action.payload.filters
      };
      break;

    case ActionCreators.SetComment.type:
      partialState = {
        comment: action.payload,
        busy: false
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}