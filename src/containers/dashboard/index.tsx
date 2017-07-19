import * as React from "react";
import { IRootState } from "../../store";
import { logout } from "../../store/authentication/actions";
import { default as connectWrapper, returntypeof } from "../../utils/connectWrapper";
import { Route } from "react-router-dom";
import { push } from "react-router-redux";
import { AppBar, IconButton, Drawer, MenuItem, FontIcon } from "material-ui";

// Map state to props
const mapStateToProps = ( state: IRootState ) => ( {
  auth: state.authentication
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
@connectWrapper( mapStateToProps, dispatchToProps )
export class Dashboard extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      menuOpen: false
    }
  }

  render() {

    return (
      <div className="dashboard">
        <AppBar
          title="Welcome to Modepress"
          onLeftIconButtonTouchTap={e => this.setState({ menuOpen: true })}
          iconElementRight={<IconButton iconClassName="fa fa-sign-out" onClick={e => this.props.logout!()} />} />

        <Route path="/" exact={true} render={props => <h1>Home</h1>} />
        <Route path="/users" render={props => <h1>Users</h1>} />

        <Drawer open={this.state.menuOpen}>
          <MenuItem leftIcon={<FontIcon className="fa fa-home" />} onClick={e => this.props.push!('/')}>
            Home
          </MenuItem>
          <MenuItem leftIcon={<FontIcon className="fa fa-users" />} onClick={e => this.props.push!('/users')}>
            Users
          </MenuItem>
          <MenuItem leftIcon={<FontIcon className="fa fa-sign-out" />} onClick={e => this.props.logout!()}>
            Sign Out
          </MenuItem>
          <IconButton
            onClick={e => this.setState({ menuOpen: false }) }
            style={{ position: 'absolute', bottom: '0', right: '0' }}
            iconClassName="fa fa-chevron-left"
          />
        </Drawer>
      </div>
    );
  }
};