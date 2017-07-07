import * as React from "react";
import { Routes } from "../components/routes";
import { IRootState } from "../store";
import { increment } from "../store/counter/actions";
import { default as connectWrapper, returntypeof } from "../utils/connectWrapper";
import { push } from 'react-router-redux';

// Map state to props
const mapStateToProps = ( state: IRootState ) => ( {
  countState: state.countState,
  routing: state.router
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  increment: increment,
  push: push
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

  render() {
    const content = (
      <div>
        <Routes onGoTo={e => this.props.push!( e )} />
        {
          this.props.countState!.busy ? "Loading..." : <div>We have this many counters! {this.props.countState!.count}</div>
        }
        <button onClick={e => this.props.increment!( 50 )}>Click here to add 50</button>
      </div>
    );

    return content;
  }
};