import { ActionCreators, Action } from './actions';
import { Template, PaginatedTemplateResponse } from 'mantle';

// State
export type State = {
  readonly template: Template | null;
  readonly templatesPage: PaginatedTemplateResponse | null;
  readonly busy: boolean;
};

export const initialState: State = {
  templatesPage: null,
  template: null,
  busy: false,
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.GetAll.type:
      partialState = {
        templatesPage: action.payload,
        busy: false,
      };
      break;

    case ActionCreators.GetOne.type:
      partialState = {
        template: action.payload,
        busy: false,
      };
      break;

    case ActionCreators.SetBusy.type:
      partialState = {
        busy: action.payload,
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
