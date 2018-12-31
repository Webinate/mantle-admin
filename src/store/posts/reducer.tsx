import { ActionCreators, Action } from './actions';
import { PostsGetAllOptions, IDocument, IDraftElement } from 'modepress';
import { Page, IPost } from '../../../../../src';
import { IDraft } from '../../../../../src/types/models/i-draft';

// State
export type State = {
  readonly postFilters: Partial<PostsGetAllOptions>;
  readonly postPage: Page<IPost<'client' | 'expanded'>> | null;
  readonly post: IPost<'client' | 'expanded'> | null;
  readonly busy: boolean;
  readonly selection: string[];
  readonly draftElements: IDraftElement<'client' | 'expanded'>[] | null;
};

export const initialState: State = {
  postFilters: { index: 0 },
  postPage: null,
  post: null,
  busy: false,
  selection: [],
  draftElements: null
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

    case ActionCreators.SetTemplate.type:
      partialState = { post: { ...state.post!, document: action.payload } as IPost<'expanded'> };
      break;

    case ActionCreators.SetPost.type:
      let doc = action.payload.document as IDocument<'client'>;
      let draft = doc.currentDraft as IDraft<'client' | 'expanded'>;

      partialState = {
        post: action.payload,
        draftElements: [ ...draft.elements ],
        busy: false
      };
      break;

    case ActionCreators.AddElement.type:
      let elements: IDraftElement<'client' | 'expanded'>[];
      if ( action.payload.index !== undefined ) {
        state.draftElements!.splice( action.payload.index, 0, action.payload.elm );
        elements = [ ...state.draftElements! ];
      }
      else
        elements = state.draftElements!.concat( action.payload.elm );

      partialState = {
        draftElements: elements,
        selection: [ action.payload.elm._id ],
        busy: false,
        post: state.post!
      };
      break;

    case ActionCreators.UpdateElement.type:
      partialState = {
        draftElements: state.draftElements!.map( elm => elm._id === action.payload._id ? action.payload : elm ),
        post: state.post!
      };
      break;

    case ActionCreators.SetElmSelection.type:
      partialState = {
        selection: action.payload
      };
      break;

    case ActionCreators.RemoveElements.type:
      partialState = {
        draftElements: state.draftElements!.filter( elm => !action.payload.includes( elm._id ) ),
        selection: [],
        busy: false,
        post: state.post!
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}