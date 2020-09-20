import { ActionCreator } from '../actions-creator';
import {
  Post,
  PaginatedPostsResponse,
  Document,
  AddElementInput,
  UpdateElementInput,
  AddPostInput,
  UpdatePostInput,
  Element,
} from 'mantle';
import { QueryPostsArgs } from 'mantle';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { push } from 'react-router-redux';
import { graphql } from '../../utils/httpClients';
import { ADD_POST, GET_POST, GET_POSTS, REMOVE_POST, UPDATE_POST } from '../../graphql/requests/post-requests';
import {
  SET_TEMPLATE,
  GET_DOCUMENT,
  ADD_ELEMENT,
  PATCH_ELEMENT,
  REMOVE_ELEMENT,
} from '../../graphql/requests/document-requests';

// Action Creators
export const ActionCreators = {
  SetPostsBusy: new ActionCreator<'posts-busy', boolean>('posts-busy'),
  AddElement: new ActionCreator<'posts-add-elm', { elms: Element[]; index?: number }>('posts-add-elm'),
  UpdateElement: new ActionCreator<'posts-update-elm', Element>('posts-update-elm'),
  RemoveElements: new ActionCreator<'posts-remove-elms', string[]>('posts-remove-elms'),
  SetPosts: new ActionCreator<'posts-set-posts', { page: PaginatedPostsResponse; filters: Partial<QueryPostsArgs> }>(
    'posts-set-posts'
  ),
  SetPost: new ActionCreator<'posts-set-post', Post>('posts-set-post'),
  SetTemplate: new ActionCreator<'posts-set-template', Document>('posts-set-template'),
  SetElmSelection: new ActionCreator<'posts-elm-set-selection', string[]>('posts-elm-set-selection'),
  SetFocussedElm: new ActionCreator<'posts-elm-set-focus', string>('posts-elm-set-focus'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

/**
 * Refreshes the user state
 */
export function getPosts(options: Partial<QueryPostsArgs>) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      const state = getState();
      const newFilters = { ...state.posts.postFilters, ...options };

      dispatch(ActionCreators.SetPostsBusy.create(true));
      const resp = await graphql<{ posts: PaginatedPostsResponse }>(GET_POSTS, newFilters);
      // const resp = await posts.getAll(newFilters);
      dispatch(ActionCreators.SetPosts.create({ page: resp.posts, filters: newFilters }));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

export function getPost(id: string) {
  return async function (dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.SetPostsBusy.create(true));
    const resp = await graphql<{ post: Post }>(GET_POST, { id });
    // const resp = await posts.getOne({ id });
    dispatch(ActionCreators.SetPost.create(resp.post));
  };
}

export function createPost(post: Partial<AddPostInput>) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      const resp = await graphql<{ createPost: Post }>(ADD_POST, { token: post });
      // const resp = await posts.create(post);
      dispatch(AppActions.serverResponse.create(`New Post '${resp.createPost.title}' created`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
      dispatch(push(`/dashboard/posts/edit/${resp.createPost._id}`));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

export function deletePosts(toDelete: Partial<Post>[]) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      const promises = toDelete.map((p) => {
        return graphql<{ removePost: Post }>(REMOVE_POST, { id: p._id });
        // return posts.remove(p._id!)
      });
      await Promise.all(promises);

      dispatch(
        AppActions.serverResponse.create(
          toDelete.length > 1 ? `Deleted [${toDelete.length}] posts` : `Post '${toDelete[0].title}' deleted`
        )
      );
      const state = getState();
      const filters = { ...state.posts.postFilters, ...{ index: 0, keyword: '' } };
      // const resp = await posts.getAll(filters);
      const resp = await graphql<{ posts: PaginatedPostsResponse }>(GET_POSTS, filters);
      dispatch(ActionCreators.SetPosts.create({ page: resp.posts, filters: filters }));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

export function editPost(post: Partial<UpdatePostInput>) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      const resp = await graphql<{ patchPost: Post }>(UPDATE_POST, { token: post });
      // const resp = await posts.update(post._id as string, post);
      dispatch(ActionCreators.SetPost.create(resp.patchPost));
      dispatch(AppActions.serverResponse.create(`Post '${resp.patchPost.title}' updated`));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

export function changeTemplate(docId: string, templateId: string) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      await graphql<{ changeDocTemplate: Post }>(SET_TEMPLATE, { template: templateId, id: docId });
      const resp = await graphql<{ document: Document }>(GET_DOCUMENT, { id: docId });
      // const resp = await documents.setTemplate(docId, templateId);
      dispatch(ActionCreators.SetTemplate.create(resp.document));
      dispatch(AppActions.serverResponse.create(`Post template updated`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

function getSelectedIndex(state: IRootState) {
  const selection = state.posts.selection;
  const elements = state.posts.elements || [];
  const index =
    selection.length > 0 ? elements.findIndex((el) => el._id === selection[selection.length - 1]) + 1 : undefined;
  return index;
}

export function addElement(docId: string, elements: Partial<AddElementInput>[], index?: number) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      index = index !== undefined ? index : getSelectedIndex(getState());

      const resp = await Promise.all(
        elements.map((e) => {
          return graphql<{ addDocElement: Element }>(ADD_ELEMENT, { token: e, docId });
          // return documents.addElement(docId, e, index);
        })
      );
      dispatch(ActionCreators.AddElement.create({ elms: resp.map((r) => r.addDocElement), index: index }));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

export function updateElement(
  docId: string,
  token: Partial<UpdateElementInput>,
  createElement: Partial<AddElementInput> | null,
  deselect: 'select' | 'deselect' | 'none'
) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      const resp = await graphql<{ updateDocElement: Element }>(PATCH_ELEMENT, { token, docId });
      // const resp = await documents.editElement(docId, elementId, token);
      dispatch(ActionCreators.UpdateElement.create(resp.updateDocElement));
      if (createElement) {
        const index = getSelectedIndex(getState());
        const newElm = await graphql<{ addDocElement: Element }>(ADD_ELEMENT, { token: createElement, docId });
        // const newElm = await documents.addElement(docId, createElement, index);
        dispatch(ActionCreators.AddElement.create({ elms: [newElm.addDocElement], index: index }));
        if (deselect === 'deselect') dispatch(ActionCreators.SetElmSelection.create([]));
      } else {
        dispatch(ActionCreators.SetPostsBusy.create(false));
        if (deselect === 'deselect') dispatch(ActionCreators.SetElmSelection.create([]));
        else if (deselect === 'select')
          dispatch(ActionCreators.SetFocussedElm.create(resp.updateDocElement._id as string));
      }
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}

export function deleteElements(docId: string, ids: string[]) {
  return async function (dispatch: Function, getState: () => IRootState) {
    try {
      dispatch(ActionCreators.SetPostsBusy.create(true));
      await Promise.all(
        ids.map((id) => {
          return graphql<{ removeDocElement: boolean }>(REMOVE_ELEMENT, { elementId: id, docId });
          // return documents.removeElement(docId, id)
        })
      );
      dispatch(ActionCreators.RemoveElements.create(ids));
    } catch (err) {
      dispatch(AppActions.serverResponse.create(`Error: ${err.message}`));
      dispatch(ActionCreators.SetPostsBusy.create(false));
    }
  };
}
