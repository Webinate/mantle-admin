import { ActionCreators, Action } from './actions';
import { ITemplate, Page } from 'mantle';

// State
export type State = {
  readonly template: ITemplate<'client' | 'expanded'> | null;
  readonly templatesPage: Page<ITemplate<'client' | 'expanded'>> | null;
  readonly busy: boolean;
};

export const initialState: State = {
  templatesPage: null,
  template: null,
  busy: false
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.GetAll.type:
      partialState = {
        templatesPage: action.payload,
        busy: false
      };
      break;

    case ActionCreators.GetOne.type:
      partialState = {
        template: action.payload,
        busy: false
      };
      break;

    case ActionCreators.SetBusy.type:
      partialState = {
        busy: action.payload
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
