import * as React from "react";
import { LoginForm } from "../login-form";
import { RegisterForm } from "../register-form";
import MantleDiv from "../mantle-background";

type Prop = {
  activeComponent: 'login' | 'register';
}

export class AuthScreen extends React.Component<Prop, any> {
  constructor() {
    super();
  }

  render() {
    return (
      <MantleDiv className="auth-screen">
        <div>
          <img src="./images/mantle-logo.svg" />
          {
            this.props.activeComponent === 'login' ?
              <LoginForm /> : <RegisterForm />
          }
        </div>
      </MantleDiv>
    )
  }
}