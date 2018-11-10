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
  readonly selection: string[];
};

export const initialState: State = {
  postFilters: { index: 0 },
  postPage: null,
  post: null,
  busy: false,
  selection: []
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
      var shallowCopy = { ...state.post! };
      var doc = shallowCopy.document as IDocument<'client'>;
      var draft = doc.currentDraft as IPopulatedDraft<'client'>;
      draft.elements.push( action.payload );

      partialState = {
        selection: [ action.payload._id ],
        busy: false,
        post: shallowCopy
      };
      break;

    case ActionCreators.UpdateElement.type:
      var shallowCopy = { ...state.post! };
      var doc = shallowCopy.document as IDocument<'client'>;
      var draft = doc.currentDraft as IPopulatedDraft<'client'>;
      draft.elements = draft.elements.map( elm => elm._id === action.payload._id ? action.payload : elm );

      partialState = {
        selection: [],
        busy: false,
        post: shallowCopy
      };
      break;

    case ActionCreators.SetElmSelection.type:
      partialState = {
        selection: action.payload
      };
      break;

    case ActionCreators.RemoveElements.type:
      var shallowCopy = { ...state.post! };
      var doc = shallowCopy.document as IDocument<'client'>;
      var draft = doc.currentDraft as IPopulatedDraft<'client'>;
      draft.elements = draft.elements.filter( elm => !action.payload.includes( elm._id ) );

      partialState = {
        selection: [],
        busy: false,
        post: shallowCopy
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}