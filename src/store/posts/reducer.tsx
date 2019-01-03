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
  readonly focussedId: string;
  readonly draftElements: IDraftElement<'client' | 'expanded'>[] | null;
};

export const initialState: State = {
  postFilters: { index: 0 },
  postPage: null,
  post: null,
  busy: false,
  focussedId: '',
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
        state.draftElements!.splice( action.payload.index, 0, ...action.payload.elms );
        elements = [ ...state.draftElements! ];
      }
      else
        elements = state.draftElements!.concat( action.payload.elms );

      partialState = {
        draftElements: elements,
        selection: [ action.payload.elms[ action.payload.elms.length - 1 ]._id ],
        focussedId: action.payload.elms.length === 1 ? action.payload.elms[ 0 ]._id : '',
        busy: false,
        post: state.post!
      };
      break;

    case ActionCreators.SetFocussedElm.type:
      partialState = {
        focussedId: action.payload
      };
      break;

    case ActionCreators.UpdateElement.type:
      partialState = {
        draftElements: state.draftElements!.map( elm => elm._id === action.payload._id ? action.payload : elm ),
        focussedId: '',
        post: state.post!
      };
      break;

    case ActionCreators.SetElmSelection.type:
      partialState = {
        selection: action.payload,
        focussedId: action.payload.length === 0 ? '' : state.focussedId
      };
      break;

    case ActionCreators.RemoveElements.type:
      partialState = {
        draftElements: state.draftElements!.filter( elm => !action.payload.includes( elm._id ) ),
        selection: [],
        focussedId: '',
        busy: false,
        post: state.post!
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}