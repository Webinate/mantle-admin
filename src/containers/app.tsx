import * as React from "react";
// import { Routes } from "../components/routes";
import { Dashboard } from "../containers/dashboard";
import { IRootState } from "../store";
import { increment } from "../store/counter/actions";
import { login } from "../store/authentication/actions";
import { default as connectWrapper, returntypeof } from "../utils/connectWrapper";
import { push } from 'react-router-redux';
import { Route } from "react-router-dom";
import { AuthScreen } from "../components/auth-screen";

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  countState: state.countState,
  auth: state.authentication,
  routing: state.router,
  location: ownProps
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  increment: increment,
  push: push,
  login: login
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class App extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
  }

  getAuthScreen( formType: "login" | "register" ) {
    return <AuthScreen
      loading={this.props.auth!.busy}
      error={this.props.auth!.error}
      activeComponent={formType}
      onLogin={( user, pass ) => this.props.login!( { username: user, password: pass, rememberMe: true } )}
      onActivationReset={( user ) => { }}
      onPasswordReset={( user ) => { }}
      onRegister={( user ) => { }}
    />;
  }

  render() {
    // <Route path="/" exact={true} render={props => <Routes onGoTo={e => this.props.push!( e )} />} />
    //     {
    //       this.props.countState!.busy ? "Loading..." : <div>We have this many counters! {this.props.countState!.count}</div>
    //     }
    //     <button onClick={e => this.props.increment!( 50 )}>Click here to add 50</button>

    return (
      <div>
        <Route path="/login" render={props => this.getAuthScreen( 'login' )} />
        <Route path="/register" render={props => this.getAuthScreen( 'register' )} />
        <Route path="/" exact render={props => <Dashboard />} />
      </div>
    );
  }
};