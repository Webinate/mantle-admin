import gql from '../../utils/gql';

export const DOCUMENT_FRAG = gql`
  fragment DocumentFragment on Document {
    _id
    createdOn
    elements {
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
    elementsOrder
    html
    lastUpdated
    template {
      _id
      defaultZone
      description
      name
      zones
    }
  }
`;

export const POST_FRAG = gql`
  fragment PostFragment on Post {
    _id
    brief
    createdOn
    lastUpdated
    public
    title
    tags
    slug
    author {
      _id
      avatar
      username
      avatarFile {
        _id
        publicURL
      }
    }
    latestDraft {
      _id
      createdOn
      html
    }
    featuredImage {
      _id
      name
      publicURL
    }
    document {
      ...DocumentFragment
    }
  }
`;

export const GET_POST = gql`
  query GET_POST($id: ObjectId, $slug: String) {
    post(id: $id, slug: $slug) {
      ...PostFragment
    }
  }

  ${POST_FRAG}
  ${DOCUMENT_FRAG}
`;

export const ADD_POST = gql`
  mutation ADD_POST($token: AddPostInput!) {
    createPost(token: $token) {
      ...PostFragment
    }
  }

  ${POST_FRAG}
  ${DOCUMENT_FRAG}
`;

export const UPDATE_POST = gql`
  mutation UPDATE_POST($token: UpdatePostInput!) {
    patchPost(token: $token) {
      ...PostFragment
    }
  }

  ${POST_FRAG}
  ${DOCUMENT_FRAG}
`;

export const REMOVE_POST = gql`
  mutation REMOVE_POST($id: ObjectId!) {
    removePost(id: $id)
  }
`;

export const GET_POSTS = gql`
  query GET_POSTS(
    $author: String
    $categories: [ObjectId!]
    $index: Int
    $keyword: String
    $limit: Int
    $requiredTags: [String!]
    $sortOrder: SortOrder
    $sortType: PostSortType
    $tags: [String!]
    $visibility: PostVisibility
  ) {
    posts(
      visibility: $visibility
      author: $author
      categories: $categories
      index: $index
      keyword: $keyword
      limit: $limit
      requiredTags: $requiredTags
      sortOrder: $sortOrder
      sortType: $sortType
      tags: $tags
    ) {
      index
      limit
      count
      data {
        ...PostFragment
      }
    }
  }

  ${POST_FRAG}
  ${DOCUMENT_FRAG}
`;
