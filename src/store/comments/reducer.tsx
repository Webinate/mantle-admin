import { ActionCreators, Action } from './actions';
import { Comment, PaginatedCommentsResponse, Post, QueryCommentsArgs } from 'mantle';
import { ActionCreators as AppActions, Action as AppAction } from '../app/actions';

// State
export type State = {
  readonly commentFilters: Partial<QueryCommentsArgs>;
  readonly commentPage: PaginatedCommentsResponse | null;
  readonly comment: Comment | null;
  readonly busy: boolean;
  readonly postPreview: Post | null;
};

export const initialState: State = {
  commentFilters: { index: 0, root: true },
  commentPage: null,
  comment: null,
  busy: false,
  postPreview: null,
};

// Reducer
export default function reducer(state: State = initialState, action: Action | AppAction): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.SetCommentsBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetComments.type:
      partialState = {
        busy: false,
        commentPage: action.payload.page,
        commentFilters: { ...state.commentFilters, ...action.payload.filters },
      };
      break;

    case ActionCreators.SetCommentPostPreview.type:
      partialState = {
        postPreview: action.payload,
      };
      break;

    case ActionCreators.SetComment.type:
      partialState = {
        comment: action.payload,
        busy: false,
      };
      break;

    case AppActions.serverResponse.type:
      partialState = {
        busy: false,
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
