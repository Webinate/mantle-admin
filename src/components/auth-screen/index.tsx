import * as React from "react";
import { LoginForm } from "../login-form";
import { RegisterForm } from "../register-form";
import MantleDiv from "../mantle-background";
import { LinearProgress } from "material-ui";

type Prop = {
  loading: boolean;
  activeComponent: 'login' | 'register';
  error: string | null | undefined;
  onLogin: ( user: string, password: string ) => void;
  onPasswordReset: ( user: string ) => void;
  onActivationReset: ( user: string ) => void;
  onRegister: ( user: string, password: string ) => void;
}

export class AuthScreen extends React.Component<Prop, any> {
  constructor() {
    super();
  }

  render() {
    return (
      <MantleDiv className="auth-screen">
        <div className="outer-container">
          {this.props.loading ? <LinearProgress /> : undefined}
          <div className="inner-container">
            <img src="./images/mantle-logo.svg" />
            {
              this.props.activeComponent === 'login' ?
                <LoginForm
                  loading={this.props.loading}
                  onLogin={this.props.onLogin}
                  onPasswordReset={this.props.onPasswordReset}
                  onActivationReset={this.props.onActivationReset}
                /> :
                <RegisterForm
                  onRegister={this.props.onRegister}
                  loading={this.props.loading}
                />
            }
            {this.props.error ? <div className="error">{this.props.error}</div> : undefined}
          </div>
        </div>
      </MantleDiv>
    )
  }
}