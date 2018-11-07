import { ActionCreators, Action } from './actions';
import { PostsGetAllOptions, IDocument } from 'modepress';
import { Page, IPost } from '../../../../../src';
import { IPopulatedDraft } from '../../../../../src/types/models/i-draft';

// State
export type State = {
  readonly postFilters: Partial<PostsGetAllOptions>;
  readonly postPage: Page<IPost<'client'>> | null;
  readonly post: IPost<'client'> | null;
  readonly busy: boolean;
  readonly activeElement: string | null;
};

export const initialState: State = {
  postFilters: { index: 0 },
  postPage: null,
  post: null,
  busy: false,
  activeElement: null
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetPosts.type:
      partialState = {
        postPage: action.payload.page,
        postFilters: { ...state.postFilters, ...action.payload.filters },
        busy: false
      };
      break;

    case ActionCreators.SetPostsBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.SetPost.type:
      partialState = {
        post: action.payload,
        busy: false
      };
      break;

    case ActionCreators.AddElement.type:
      const shallowCopy = { ...state.post! };
      const doc = shallowCopy.document as IDocument<'client'>;
      const draft = doc.currentDraft as IPopulatedDraft<'client'>;
      draft.elements.push( action.payload );

      partialState = {
        activeElement: action.payload._id,
        busy: false,
        post: shallowCopy
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}