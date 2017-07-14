import * as React from "react";
import { Link } from 'react-router-dom';
import { RaisedButton, TextField, FontIcon } from "material-ui";

type State = {
  user: string;
  pass: string;
  pass2: string;
  formSubmitted: boolean;
}

export class RegisterForm extends React.Component<any, State> {
  constructor() {
    super();
    this.state = {
      user: '',
      pass: '',
      pass2: '',
      formSubmitted: false
    }
  }

  private onRegister() {
    this.setState( { formSubmitted: true } );
  }

  render() {
    return (
      <form className="register-form" action="" name="register">
        <TextField
          value={this.state.user}
          onChange={( e, text ) => this.setState( { user: text } )}
          fullWidth={true}
          floatingLabelText="Username"
          type="text" name="username"
          errorText={this.state.formSubmitted && !this.state.user ? 'Please specify a username' : ''}
          id="user" />
        <TextField
          value={this.state.pass}
          onChange={( e, text ) => this.setState( { pass: text } )}
          fullWidth={true}
          errorText={this.state.formSubmitted && !this.state.user ? 'Please specify a username' : ''}
          floatingLabelText="Password"
          type="password" name="password"
          id="pass" />
        <TextField
          value={this.state.pass2}
          onChange={( e, text ) => this.setState( { pass2: text } )}
          fullWidth={true}
          floatingLabelText="Repeat Password"
          type="password" name="password2"
          errorText={this.state.pass !== this.state.pass2 ? 'Passwords do not match' : ''}
          id="pass2" />
        <div className="buttons">
          <RaisedButton
            label="Login"
            fullWidth={true}
            onClick={e => this.onRegister()}
            icon={<FontIcon className="fa fa-sign-in" />}
            primary={true} />
          <div className="anchor-btns">
            <Link to="/login">🡐 Back to Login</Link>
          </div>
        </div>
      </form>
    )
  }
}