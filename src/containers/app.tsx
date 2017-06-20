import * as React from "react";
import {IRootState} from "../store";
import {increment} from "../store/counter/actions";
import {default as connectWrapper, returntypeof} from "../utils/connectWrapper";

// Map state to props
const mapStateToProps = ( state: IRootState ) => ( {
  countState: state.countState
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  increment: increment
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

  constructor(props: Props) {
    super(props);
  }

  /**
   * Do something when we click the btn
   */
  private onBtnClick() {
    this.props.increment!(3);
  }

  render() {
    const content = (
      <html>
        <head>
          <title>Modepress Example</title>
          <link rel='stylesheet' href='css/main.css' />
          <meta charSet="utf-8" />
          <meta name="description" content=""/>
          <meta name="HandheldFriendly" content="True"/>
          <meta name="MobileOptimized" content="320"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui"/>
          <meta httpEquiv="cleartype" content="on"/>
          <link rel="icon" type="image/png" href="images/favicon.png" />
        </head>
        <body>
            {this.props.children}
            <div>The count is: {this.props.countState!.count}</div>
            <button onClick={() => this.onBtnClick()}>Increase</button>
            <script dangerouslySetInnerHTML={{
                __html: 'window.PROPS={{{INITIAL_STATE}}}'
            }} />
            <script src="./bundle.js" />
        </body>
      </html>
    );

    return content;
  }
};