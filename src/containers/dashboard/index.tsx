import * as React from "react";
import { IRootState } from "../../store";
import { Dashboard as Dash } from "../../components/dashboard";
import { logout, ActionCreators } from "../../store/authentication/actions";
import { connectWrapper, returntypeof, hydrate } from "../../utils/decorators";
import { Route, Switch } from "react-router-dom";
import { push } from "react-router-redux";
import { IAuthReq } from 'modepress';

// Map state to props
const mapStateToProps = ( state: IRootState ) => ( {
  auth: state.authentication,
  router: state.router
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  logout: logout,
  push: push
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  menuOpen: boolean;
};

/**
 * The main application entry point
 */
@hydrate( { path: '/', actions: ( matches, req: IAuthReq ) => [ ActionCreators.setUser.create( req._user ) ] } )
@connectWrapper( mapStateToProps, dispatchToProps )
export class Dashboard extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      menuOpen: false
    }
  }

  private logOut() {
    this.setState( { menuOpen: false } );
    this.props.logout!();
  }

  private goTo( path: string ) {
    this.setState( { menuOpen: false } );
    this.props.push!( path );
  }

  render() {

    return (
      <Dash
        title={this.props.auth!.user ? `Welcome back ${ this.props.auth!.user!.username }` : 'Welcome to Modepress'}
        items={[
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
            return <h1>Users</h1>
          }} />
          <Route render={props => <h1>Not Found</h1>} />
        </Switch>
      </Dash>
    );
  }
};