import * as React from "react";

export type Props = {
  title: string;
}
type State = {

}

/**
 * The main application entry point
 */
export class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  /**
   * Do something when we click the btn
   */
  private onBtnClick() {
    alert();
  }

  render() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
          <link rel='stylesheet' href='/style.css' />
          <meta charSet="utf-8" />
          <meta name="description" content=""/>
          <meta name="HandheldFriendly" content="True"/>
          <meta name="MobileOptimized" content="320"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui"/>
          <meta httpEquiv="cleartype" content="on"/>
          <link rel="shortcut icon" href="favicon.png" type="image/png" />
        </head>
        <body>
            <div>
              <h1>Hello World!</h1>
              <p>Isn't server-side rendering remarkable?</p>
              <button onClick={this.onBtnClick}>Click Me</button>
            </div>
            <script dangerouslySetInnerHTML={{
                __html: 'window.PROPS=' + JSON.stringify(this.props)
            }} />
            <script src="./bundle.js" />
        </body>
      </html>
    );
  }
};