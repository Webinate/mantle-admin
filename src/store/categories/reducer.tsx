import { ActionCreators, Action } from './actions';
import { Page, ICategory } from '../../../../../src';

// State
export type State = {
  readonly categoryPage: Page<ICategory<'expanded'>> | null;
  readonly category: ICategory<'client' | 'expanded'> | null;
  readonly busy: boolean;
  readonly error: string | null;
};

export const initialState: State = {
  categoryPage: null,
  category: null,
  error: null,
  busy: false,
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.SetCategories.type:
      partialState = {
        categoryPage: action.payload,
        busy: false,
      };
      break;

    case ActionCreators.SetCategoryErr.type:
      partialState = {
        error: action.payload,
        busy: false,
      };
      break;

    case ActionCreators.SetCategoriesBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetCategory.type:
      partialState = {
        category: action.payload,
        busy: false,
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
