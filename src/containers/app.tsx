import * as React from 'react';
import { IRootState } from '../store';
import { login, logout, register } from '../store/authentication/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { push } from 'react-router-redux';
import { Route, Redirect, Switch } from 'react-router-dom';
import { AuthScreen } from '../components/auth-screen';
import { Dashboard } from '../components/dashboard';
import { ContentHeader } from '../components/content-header';
import { Users } from './users';
import { List, ListItem, FontIcon } from 'material-ui';

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
  register: register,
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
      onRegister={( user, email, password ) => this.props.register!( { username: user, password: password, email: email } )}
    />;
  }

  render() {

    const items = [
      { label: 'Home', icon: 'icon-home', path: '/dashboard', onClick: () => this.goTo( '/dashboard' ) },
      { label: 'Users', icon: 'icon-people', path: '/dashboard/users', onClick: () => this.goTo( '/dashboard/users' ) }
    ];

    return (
      <div>
        <Route path="/" exact={true} render={props => <Redirect to="/dashboard" />} />
        <Route path="/dashboard" render={props => {
          return (
            <Dashboard
              title={'Mantle'}
              renderRight={() => <h3>Properties</h3>}
              renderLeft={() => {
                return (
                  <List style={{ padding: '0' }}>
                    {items.map( ( i, index ) => {
                      return <ListItem
                        className={props.location.pathname === i.path ? 'selected' : ''}
                        key={`menu-item-${ index }`}
                        onClick={e => i.onClick()}
                        primaryText={i.label}
                        leftIcon={<FontIcon style={{ color: 'inherit', transition: '' }} className={i.icon}
                        />} />
                    } )
                    }
                  </List>
                );
              }}

              onHome={() => this.goTo( '/dashboard' )}
              onLogOut={() => this.logOut()}
            >
              <Switch>
                <Route path="/dashboard" exact={true} render={props => {
                  return <ContentHeader title="Home" />
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