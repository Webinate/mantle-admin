import * as React from "react";
import { FlatButton, RaisedButton, TextField, FontIcon } from "material-ui";

export class LoginForm extends React.Component<any, any> {
  render() {
    return (
      <div className="login-form">
        <svg viewBox="0 0 300 400" preserveAspectRatio="xMinYMin slice" className="bg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <g>
            <title>background</title>
            <rect fill="#fff" id="canvas_background" height="402" width="582" y="-1" x="-1" />
            <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
              <rect fill="url(#gridpattern)" strokeWidth="0" y="0" x="0" height="100%" width="100%" />
            </g>
          </g>
          <g>
            <title>Layer 1</title>
            <path id="svg_4" d="m504.5,-57c0,0 -240,298 -240,298c0,0 226,224 226,224c0,0 104,-532 104,-532c0,0 -90,10 -90,10z" strokeOpacity="null" strokeWidth="0" stroke="#000" fill="#f7f7f7" />
            <path stroke="#000" id="svg_5" d="m4.5,-33c0,0 277.906534,464 277.906534,464c0,0 194.093452,-476 194.093452,-476" opacity="0.5" strokeOpacity="null" strokeWidth="0" fill="#f4f4f4" />
            <path id="svg_6" d="m140.5,-13c-8,40 -130,468 -130,468c0,0 148,6 148,6c0,0 -10,-514 -18,-474z" fillOpacity="null" strokeOpacity="null" strokeWidth="0" stroke="#000" fill="#f7f7f7" />
          </g>
        </svg>
        <div>
          <h3>Login</h3>
          <form action="" name="login">
            <TextField fullWidth={true} floatingLabelText="Username" type="text" name="username" id="login-user" />
            <TextField fullWidth={true} floatingLabelText="Password" type="password" name="password" id="login-pass" />
            <div className="buttons">
              <RaisedButton
                label="Login"
                fullWidth={true}
                icon={<FontIcon className="fa fa-sign-in" />}
                primary={true} />
              <div className="anchor-btns">
                <a href="/register">Create an Account</a> | <a href="">Retrieve Password</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}