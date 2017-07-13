import * as React from "react";
import { RaisedButton, TextField, FontIcon } from "material-ui";

export class LoginForm extends React.Component<any, { user: string; pass: string; }> {
  constructor() {
    super();
    this.state = {
      user: '',
      pass: ''
    }
  }

  private retrievePass() {

  }

  render() {
    return (
      <div className="login-form">
        <div>
          <img src="./images/mantle-logo.svg" />
          <form action="" name="login">
            <TextField
              value={this.state.user}
              onChange={( e, text ) => this.setState( { pass: text } )}
              fullWidth={true}
              floatingLabelText="Username"
              type="text" name="username"
              id="login-user" />
            <TextField
              value={this.state.pass}
              onChange={( e, text ) => this.setState( { user: text } )}
              fullWidth={true}
              floatingLabelText="Password"
              type="password" name="password"
              id="login-pass" />
            <div className="buttons">
              <RaisedButton
                label="Login"
                fullWidth={true}
                icon={<FontIcon className="fa fa-sign-in" />}
                primary={true} />
              <div className="anchor-btns">
                <a href="/register">Create an Account</a> | <a href="" onClick={e => this.retrievePass()}>Retrieve Password</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}