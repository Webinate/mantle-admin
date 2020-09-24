import gql from '../../utils/gql';

export const LOGIN = gql`
  mutation LOGIN($token: LoginInput!) {
    login(token: $token) {
      authenticated
      message
      user {
        _id
        username
        avatar
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation LOGOUT {
    logout
  }
`;

export const REGISTER = gql`
  mutation REGISTER($token: RegisterInput!) {
    register(token: $token) {
      authenticated
      message
      user {
        _id
        username
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation REQUEST_PASSWORD_RESET($username: String!) {
    requestPasswordReset(username: $username)
  }
`;

export const APPROVE_ACTIVATION = gql`
  mutation APPROVE_ACTIVATION($username: String!) {
    approveActivation(username: $username)
  }
`;

export const RESEND_ACTIVATION = gql`
  mutation RESEND_ACTIVATION($username: String!) {
    resendActivation(username: $username)
  }
`;

export const RESET_PASSWORD = gql`
  mutation RESET_PASSWORD($password: String!, $key: String!, $username: String!) {
    passwordReset(password: $password, key: $key, username: $username)
  }
`;
