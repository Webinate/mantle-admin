import * as React from 'react';
import { Link } from 'react-router-dom';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { default as styled } from '../theme/styled';
import RegisterIcon from '@material-ui/icons/AccountBox';

type Props = {
  loading: boolean;
  onRegister: (user: string, email: string, password: string) => void;
};
type State = {
  user: string;
  email: string;
  pass: string;
  pass2: string;
  formSubmitted: boolean;
};

/**
 * A form for entering user registration information
 */
export default class RegisterForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: '',
      email: '',
      pass: '',
      pass2: '',
      formSubmitted: false
    };
  }

  private onRegister() {
    this.setState({ formSubmitted: true });
    if (this.state.user !== '' && this.state.pass !== '')
      this.props.onRegister(this.state.user, this.state.email, this.state.pass);
  }

  private showPasswordError() {
    return this.state.formSubmitted && !this.state.pass;
  }

  private showEmailError() {
    return this.state.formSubmitted && !this.state.email;
  }

  private showUsernameError() {
    return this.state.formSubmitted && !this.state.user;
  }

  render() {
    return (
      <form className="register-form" action="" name="register">
        <FormControl className="mt-username" fullWidth={true} error={this.showUsernameError()}>
          <InputLabel htmlFor="user">Username</InputLabel>
          <Input
            id="user"
            name="username"
            value={this.state.user}
            onChange={e => this.setState({ user: e.currentTarget.value })}
          />
          {this.showUsernameError() ? (
            <FormHelperText id="mt-username-error">Please specify a username</FormHelperText>
          ) : (
            undefined
          )}
        </FormControl>

        <FormControl className="mt-email" fullWidth={true} error={this.showEmailError()}>
          <InputLabel htmlFor="user">Email</InputLabel>
          <Input
            id="email"
            name="email"
            value={this.state.email}
            onChange={e => this.setState({ email: e.currentTarget.value })}
          />
          {this.state.formSubmitted && !this.state.email ? (
            <FormHelperText id="mt-email-error">Please specify an email</FormHelperText>
          ) : (
            undefined
          )}
        </FormControl>

        <FormControl fullWidth={true} className="mt-password" error={this.showPasswordError()}>
          <InputLabel htmlFor="user">Password</InputLabel>
          <Input
            id="pass"
            name="password"
            type="password"
            value={this.state.pass}
            onChange={e => this.setState({ pass: e.currentTarget.value })}
          />
          {this.showPasswordError() ? (
            <FormHelperText id="mt-password-error">Please specify a password</FormHelperText>
          ) : (
            undefined
          )}
        </FormControl>

        <FormControl fullWidth={true} className="mt-password2" error={this.state.pass !== this.state.pass2}>
          <InputLabel htmlFor="user">Repeat Password</InputLabel>
          <Input
            id="pass2"
            name="password2"
            type="password"
            value={this.state.pass2}
            onChange={e => this.setState({ pass2: e.currentTarget.value })}
          />
          {this.state.pass !== this.state.pass2 ? (
            <FormHelperText id="mt-password2-error">Passwords do not match</FormHelperText>
          ) : (
            undefined
          )}
        </FormControl>

        <ButtonsDiv>
          <Button
            variant="contained"
            className="mt-register-btn"
            disabled={this.props.loading}
            fullWidth={true}
            onClick={e => this.onRegister()}
            color="primary"
          >
            <RegisterIcon style={{ margin: '0 5px 0 0' }} />
            Create Account
          </Button>
          <AnchorBtnsDiv>
            <Link to="/login" className="mt-to-login" style={{ margin: '0 5px' }}>
              🡐 Back to Login
            </Link>
          </AnchorBtnsDiv>
        </ButtonsDiv>
      </form>
    );
  }
}

const ButtonsDiv = styled.div`
  margin: 40px 0 0 0;
`;

const AnchorBtnsDiv = styled.div`
  margin: 20px 0 0 0;
  text-align: center;
`;
