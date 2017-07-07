import * as React from "react";
import { FlatButton, RaisedButton, TextField } from "material-ui";

export class LoginForm extends React.Component<any, any> {
  render() {
    return (
      <div className="login-form">
        <div>
          <h3>Login</h3>
          <form action="" name="login">
            <TextField type="text" name="username" />
            <TextField type="password" name="password" />
            <FlatButton label="Register" />
            <RaisedButton label="Login" />
          </form>
        </div>
      </div>
    )
  }
}