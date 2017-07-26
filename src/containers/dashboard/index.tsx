import * as React from "react";
import { IRootState } from "../../store";
import { logout, ActionCreators } from "../../store/authentication/actions";
import { connectWrapper, returntypeof, hydrate } from "../../utils/decorators";
import { Route, Switch } from "react-router-dom";
import { push } from "react-router-redux";
import { AppBar, IconButton, Drawer, MenuItem, FontIcon } from "material-ui";
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
      <div className="dashboard">
        <AppBar
          title={this.props.auth!.user ? `Welcome back ${ this.props.auth!.user!.username }` : "Welcome to Modepress"}
          className="app-bar"
          style={{ background: '' }}
          onLeftIconButtonTouchTap={e => this.setState( { menuOpen: true } )}
          iconElementRight={<IconButton iconClassName="icon-sign-out" onClick={e => this.logOut()} />} />

        <Switch>
          <Route path="/dashboard" exact={true} render={props => {
            return <h1>Home</h1>
          }} />
          <Route path="/dashboard/users" render={props => {
            return <h1>Users</h1>
          }} />
          <Route render={props => <h1>Not Found</h1>} />
        </Switch>

        <Drawer docked={true} width={400} open={this.state.menuOpen}>
          <MenuItem leftIcon={<FontIcon className="icon-home" />} onClick={e => this.goTo( '/dashboard' )}>
            Home
          </MenuItem>
          <MenuItem leftIcon={<FontIcon className="icon-person" />} onClick={e => this.goTo( '/dashboard/users' )}>
            Users
          </MenuItem>
          <MenuItem leftIcon={<FontIcon className="icon-sign-out" />} onClick={e => this.logOut()}>
            Sign Out
          </MenuItem>
          <IconButton
            onClick={e => this.setState( { menuOpen: false } )}
            style={{ position: 'absolute', bottom: '0', right: '0' }}
            iconClassName="icon-navigate_before"
          />
        </Drawer>
      </div>
    );
  }
};