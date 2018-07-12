import * as React from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import { default as styled } from '../theme/styled';
import KeyIcon from '@material-ui/icons/VpnKey';

type Props = {
  loading: boolean;
  onLogin: ( user: string, password: string ) => void;
  onPasswordReset: ( user: string ) => void;
  onActivationReset: ( user: string ) => void;
}

type State = {
  user: string;
  pass: string;
  formSubmitted: boolean;
  retrievePassError: boolean;
}

/**
 * A form for entering user and password information
 */
export default class LoginForm extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      user: '',
      pass: '',
      formSubmitted: false,
      retrievePassError: false
    }
  }

  /**
   * Requests the password for a given user
   */
  private checkUsernameSet( e: React.MouseEvent<HTMLAnchorElement> ) {
    e.preventDefault();
    e.stopPropagation();
    if ( this.state.user === '' ) {
      this.setState( { retrievePassError: true, formSubmitted: false } );
      return false;
    }
    else {
      this.setState( { retrievePassError: false } );
      return true;
    }
  }

  /**
   * When we click the login button
   */
  private onLogin() {
    this.setState( { formSubmitted: true } );
    if ( this.state.user !== '' && this.state.pass !== '' )
      this.props.onLogin( this.state.user, this.state.pass );
  }

  /**
   * Gets the user error message if there is one
   */
  getUserError() {
    if ( this.state.retrievePassError )
      return 'Please specify a username';
    if ( this.state.formSubmitted && !this.state.user )
      return 'Please specify a username';

    return null;
  }

  private showPasswordError() {
    return this.state.formSubmitted && !this.state.pass;
  }

  render() {
    return (
      <form className="login-form" action="" name="login">
        <FormControl
          className="mt-username"
          fullWidth={true}
          error={this.getUserError() ? true : false}
        >
          <InputLabel htmlFor="login-user">Username</InputLabel>
          <Input
            id="login-user"
            value={this.state.user}
            onChange={( e ) => this.setState( { user: e.currentTarget.value } )}
          />
          {this.getUserError() ? <FormHelperText id="mt-username-error">{this.getUserError()}</FormHelperText> : undefined}
        </FormControl>

        <FormControl
          className="mt-password"
          fullWidth={true}
          error={this.showPasswordError()}
        >
          <InputLabel htmlFor="mt-password-error">Name</InputLabel>
          <Input
            id="mt-password"
            type="password"
            value={this.state.pass}
            onChange={( e ) => this.setState( { pass: e.currentTarget.value } )}
          />
          {this.showPasswordError() ? <FormHelperText id="mt-password-error">Please specify a password</FormHelperText> : undefined}
        </FormControl>

        <ButtonsDiv>
          <Button
            variant="contained"
            color="primary"
            className="mt-login-btn"
            disabled={this.props.loading}
            fullWidth={true}
            onClick={e => this.onLogin()}
          ><KeyIcon style={{ margin: '0 5px 0 0' }} />Login
          </Button>
          <AnchorBtnsDiv>
            <Link className="mt-create-account" to="/register">Create an Account</Link> |
            <AnchorBtns className="mt-retrieve-password" href="" onClick={e => {
              if ( this.checkUsernameSet( e ) )
                this.props.onLogin( this.state.user, this.state.pass );
            }}>Retrieve Password</AnchorBtns>
            <br />
            <AnchorBtns className="mt-resend-activation" href="" onClick={e => {
              if ( this.checkUsernameSet( e ) )
                this.props.onActivationReset( this.state.user );
            }}> Resend Activation</AnchorBtns>
          </AnchorBtnsDiv>
        </ButtonsDiv>
      </form>
    )
  }
}

const ButtonsDiv = styled.div`
  margin: 40px 0 0 0;
`;

const AnchorBtnsDiv = styled.div`
  white-space: nowrap;
  margin: 20px 0 0 0;
  text-align: center;
`;

const AnchorBtns = styled.a`
  margin: 0 5px;
`;