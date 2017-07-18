import * as React from "react";
import { IRootState } from "../../store";
import { logout } from "../../store/authentication/actions";
import { default as connectWrapper, returntypeof } from "../../utils/connectWrapper";
import { Route } from "react-router-dom";
import { AppBar, IconButton } from "material-ui";

// Map state to props
const mapStateToProps = ( state: IRootState ) => ( {
  auth: state.authentication
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
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
export class Dashboard extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
  }

  render() {

    return (
      <div className="dashboard">
        <AppBar
          title="Welcome to Modepress"
          iconElementRight={<IconButton iconClassName="fa fa-sign-out" onClick={e => this.props.logout!()} />} />

        <Route path="/" exact={true} render={props => <div>Welcome to the app</div>} />
      </div>
    );
  }
};