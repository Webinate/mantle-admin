import { ActionCreators, Action } from './actions';
import { Page, ICategory } from 'modepress';

// State
export type State = {
  readonly categoryPage: Page<ICategory> | null;
  readonly category: ICategory | null;
  readonly busy: boolean;
};

export const initialState: State = {
  categoryPage: null,
  category: null,
  busy: false
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetCategories.type:
      partialState = {
        categoryPage: action.payload,
        busy: false
      };
      break;

    case ActionCreators.SetCategoriesBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetCategory.type:
      partialState = {
        category: action.payload,
        busy: false
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}