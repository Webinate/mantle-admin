import gql from '../../utils/gql';

export const USER_FRAG = gql`
  fragment UserFields on User {
    _id
    avatar
    createdOn
    email
    isActivated
    lastLoggedIn
    meta
    privileges
    registerKey
    username
    avatarFile {
      _id
      name
      publicURL
    }
  }
`;

export const GET_USERS = gql`
  query GET_USERS($index: Int, $limit: Int, $search: String) {
    users(index: $index, limit: $limit, search: $search) {
      count
      index
      limit
      data {
        ...UserFields
      }
    }
  }

  ${USER_FRAG}
`;

export const GET_USER = gql`
  query GET_USER($user: String!) {
    user(user: $user) {
      ...UserFields
    }
  }

  ${USER_FRAG}
`;

export const REMOVE_USER = gql`
  mutation REMOVE_USER($username: String!) {
    removeUser(username: $username)
  }
`;

export const PATCH_USER = gql`
  mutation PATCH_USER($token: UpdateUserInput!) {
    updateUser(token: $token) {
      ...UserFields
    }
  }
  ${USER_FRAG}
`;

export const CREATE_USER = gql`
  mutation CREATE_USER($token: AddUserInput!) {
    addUser(token: $token) {
      ...UserFields
    }
  }

  ${USER_FRAG}
`;
