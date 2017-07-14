import * as React from "react";
import { RaisedButton, TextField, FontIcon } from "material-ui";
import { Link } from 'react-router-dom';

type State = {
  user: string;
  pass: string;
  formSubmitted: boolean;
}

export class LoginForm extends React.Component<any, State> {
  constructor() {
    super();
    this.state = {
      user: '',
      pass: '',
      formSubmitted: false
    }
  }

  private retrievePass() {

  }

  private onLogin() {
    this.setState( { formSubmitted: true } );
  }

  render() {
    return (
      <form className="login-form" action="" name="login">
        <TextField
          value={this.state.user}
          onChange={( e, text ) => this.setState( { user: text } )}
          fullWidth={true}
          errorText={this.state.formSubmitted && !this.state.user ? 'Please specify a username' : ''}
          floatingLabelText="Username"
          type="text" name="username"
          id="login-user" />
        <TextField
          value={this.state.pass}
          onChange={( e, text ) => this.setState( { pass: text } )}
          errorText={this.state.formSubmitted && !this.state.pass ? 'Please specify a password' : ''}
          fullWidth={true}
          floatingLabelText="Password"
          type="password" name="password"
          id="login-pass" />
        <div className="buttons">
          <RaisedButton
            label="Login"
            fullWidth={true}
            onClick={e => this.onLogin()}
            icon={<FontIcon className="fa fa-sign-in" />}
            primary={true} />
          <div className="anchor-btns">
            <Link to="/register">Create an Account</Link> | <a href="" onClick={e => this.retrievePass()}>Retrieve Password</a>
          </div>
        </div>
      </form>
    )
  }
}