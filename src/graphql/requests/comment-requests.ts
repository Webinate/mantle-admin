import gql from '../../utils/gql';

export const COMMENT_FRAG = gql`
  fragment CommentFields on Comment {
    _id
    author
    content
    createdOn
    lastUpdated
    public
    user {
      _id
      username
    }
  }
`;

export const GET_COMMENT = gql`
  query GET_COMMENT($id: ObjectId!) {
    comment(id: $id) {
      ...CommentFields
    }
  }

  ${COMMENT_FRAG}
`;

export const ADD_COMMENT = gql`
  mutation ADD_COMMENT($token: AddCommentInput!) {
    addComment(token: $token) {
      ...CommentFields
    }
  }

  ${COMMENT_FRAG}
`;

export const PATCH_COMMENT = gql`
  mutation PATCH_COMMENT($token: UpdateCommentInput!) {
    patchComment(token: $token) {
      ...CommentFields
    }
  }

  ${COMMENT_FRAG}
`;

export const REMOVE_COMMENT = gql`
  mutation REMOVE_COMMENT($id: ObjectId!) {
    removeComment(id: $id)
  }
`;

export const GET_COMMENTS = gql`
  query GET_COMMENTS(
    $index: Int
    $keyword: String
    $limit: Int
    $parentId: ObjectId
    $postId: ObjectId
    $root: Boolean
    $sortOrder: SortOrder
    $sortType: CommentSortType
    $user: String
    $visibility: CommentVisibility
  ) {
    comments(
      index: $index
      keyword: $keyword
      limit: $limit
      parentId: $parentId
      postId: $postId
      root: $root
      sortOrder: $sortOrder
      sortType: $sortType
      user: $user
      visibility: $visibility
    ) {
      count
      index
      limit
      data {
        _id
        author
        content
        createdOn
        lastUpdated
        public
        user {
          _id
          username
          avatar
          avatarFile {
            _id
            publicURL
          }
        }
      }
    }
  }
`;
