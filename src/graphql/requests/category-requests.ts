import gql from '../../utils/gql';

export const CATEGORY_FRAG = gql`
  fragment CategoryFields on Category {
    _id
    description
    slug
    title
  }
`;

export const GET_CATEGORIES = gql`
  query GET_CATEGORIES($index: Int, $root: Boolean, $limit: Int) {
    categories(index: $index, root: $root, limit: $limit) {
      count
      index
      limit
      data {
        _id
        description
        slug
        title
      }
    }
  }
`;

export const PATCH_CATEGORY = gql`
  mutation PATCH_CATEGORY($token: UpdateCategoryInput!) {
    updateCategory(token: $token) {
      ...CategoryFields
    }
  }

  ${CATEGORY_FRAG}
`;

export const ADD_CATEGORY = gql`
  mutation ADD_CATEGORY($token: AddCategoryInput!) {
    createCategory(token: $token) {
      ...CategoryFields
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation REMOVE_CATEGORY($id: String!) {
    removeCategory(id: $id)
  }
`;
