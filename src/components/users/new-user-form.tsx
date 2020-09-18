import * as React from 'react';
import { AddUserInput } from 'mantle';
import { default as styled } from '../../theme/styled';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { default as theme } from '../../theme/mui-theme';

type Props = {
  serverError: string;
  onUserCreated: (user: Partial<AddUserInput>) => void;
  onCancel: () => void;
};

type State = {
  user: Partial<AddUserInput>;
  isValid: boolean;
};

export default class NewUserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: {},
      isValid: false,
    };
  }

  private updateUser(user: Partial<AddUserInput>) {
    this.setState({ user: user });

    if (!user.username || !user.password || !user.email) this.setState({ isValid: false });
    else this.setState({ isValid: true });
  }

  render() {
    const user = this.state.user;

    return (
      <Container id="mt-new-user-form">
        <Details>
          <h2>Add New User</h2>
          <div>
            <TextField
              id="mt-new-username"
              onChange={(e) => this.updateUser({ ...user, username: e.currentTarget.value })}
              value={user.username}
              label="Username"
              fullWidth={true}
            />
          </div>
          <div>
            <TextField
              id="mt-new-email"
              onChange={(e) => this.updateUser({ ...user, email: e.currentTarget.value })}
              value={user.email}
              label="Email"
              fullWidth={true}
            />
          </div>
          <div>
            <TextField
              id="mt-new-password"
              onChange={(e) => this.updateUser({ ...user, password: e.currentTarget.value })}
              value={user.password}
              label="Password"
              fullWidth={true}
            />
          </div>
        </Details>

        <div className="mt-buttons">
          <Button onClick={(e) => this.props.onCancel()} id="mt-cancel-add-user">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!this.state.isValid}
            onClick={(e) => this.props.onUserCreated(this.state.user)}
            id="mt-confirm-add-user"
          >
            Add New User
          </Button>
        </div>
      </Container>
    );
  }
}

const Container = styled.div`
  width: 50%;
  margin: 40px auto;
  min-width: 400px;

  h2 {
    margin-bottom: 20px;
  }

  .mt-buttons {
    > button {
      margin: 0 5px 0 0;
    }
  }
`;

const Details = styled.div`
  background: ${theme.light100.background};
  margin: 0 0 30px 0;
  box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12);
  padding: 20px 20px 40px 20px;

  > div {
    margin: 0 0 10px 0;
  }
`;
