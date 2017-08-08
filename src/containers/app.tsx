import * as React from 'react';
import { IRootState } from '../store';
import { login, logout } from '../store/authentication/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { push } from 'react-router-redux';
import { Route, Redirect, Switch } from 'react-router-dom';
import { AuthScreen } from '../components/auth-screen';
import { Dashboard } from '../components/dashboard';
import { Users } from './users';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  userState: state.users,
  auth: state.authentication,
  routing: state.router,
  location: ownProps
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  push: push,
  login: login,
  logout: logout
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

  private logOut() {
    this.setState( { menuOpen: false } );
    this.props.logout!();
  }

  private goTo( path: string ) {
    this.setState( { menuOpen: false } );
    this.props.push!( path );
  }

  getAuthScreen( formType: 'login' | 'register' ) {
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
    return (
      <div>
        <Route path="/" exact={true} render={props => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" render={props => {
          return (
            <Dashboard
              title={this.props.auth!.user ? `Welcome back ${ this.props.auth!.user!.username }` : 'Welcome to Modepress'}
              items={[
                { label: 'Home', icon: 'icon-home', onClick: () => this.goTo( '/dashboard' ) },
                { label: 'Users', icon: 'icon-person', onClick: () => this.goTo( '/dashboard/users' ) }
              ]}
              onHome={() => this.goTo( '/dashboard' )}
              onLogOut={() => this.logOut()}
            >
              <Switch>
                <Route path="/dashboard" exact={true} render={props => {
                  return <h1>Home</h1>
                }} />
                <Route path="/dashboard/users" render={props => {
                  return <Users />
                }} />
                <Route render={props => <h1>Not Found</h1>} />
              </Switch>
            </Dashboard>
          );
        }} />
        <Route path="/login" render={props => this.getAuthScreen( 'login' )} />
        <Route path="/register" render={props => this.getAuthScreen( 'register' )} />
      </div>
    );
  }
};