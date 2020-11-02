import gql from '../../utils/gql';

export const CATEGORY_FRAG = gql`
  fragment CategoryFields on Category {
    _id
    description
    slug
    title
  }
`;

export const GET_CATEGORY = gql`
  query GET_CATEGORY($id: String, $slug: String) {
    category(id: $id, slug: $slug) {
      ...CategoryFields
    }
  }

  ${CATEGORY_FRAG}
`;

export function getCategoriesQuery(depth = 5) {
  function renderComment(depthInternal: number): string {
    return `
      _id
      description
      slug
      title
      ${depthInternal > 0 ? `children {${renderComment(depthInternal - 1)}}` : ''}
    `;
  }

  return gql`
  query GET_CATEGORIES($index: Int, $root: Boolean, $limit: Int) {
    categories(index: $index, root: $root, limit: $limit) {
      count
      index
      limit
      data {
        ${renderComment(depth)}
      }
    }
  }
`;
}

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

  ${CATEGORY_FRAG}
`;

export const REMOVE_CATEGORY = gql`
  mutation REMOVE_CATEGORY($id: String!) {
    removeCategory(id: $id)
  }
`;
