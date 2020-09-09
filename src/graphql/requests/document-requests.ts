import gql from '../../utils/gql';
import { DOCUMENT_FRAG } from './post-requests';

export const SET_TEMPLATE = gql`
  mutation SET_TEMPLATE($template: ObjectId!, $id: ObjectId!) {
    changeDocTemplate(template: $template, id: $id)
  }
`;

export const GET_DOCUMENT = gql`
  query GET_DOCUMENT($id: ObjectId!) {
    document(id: $id) {
      ...DocumentFragment
    }
  }

  ${DOCUMENT_FRAG}
`;

export const ADD_ELEMENT = gql`
  mutation ADD_ELEMENT($token: AddElementInput!, $docId: ObjectId!) {
    addDocElement(token: $token, docId: $docId) {
      _id
      html
      image {
        _id
        name
        publicURL
      }
      style
      type
      zone
    }
  }
`;

export const PATCH_ELEMENT = gql`
  mutation PATCH_ELEMENT($token: UpdateElementInput!, $docId: ObjectId!) {
    updateDocElement(token: $token, docId: $docId) {
      _id
      html
      image {
        _id
        name
        publicURL
      }
      style
      type
      zone
    }
  }
`;

export const REMOVE_ELEMENT = gql`
  mutation REMOVE_ELEMENT($elementId: ObjectId!, $docId: ObjectId!) {
    removeDocElement(elementId: $elementId, docId: $docId)
  }
`;
