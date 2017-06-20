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
    const content = (
      <html>
        <head>
          <title>{this.props.title}</title>
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
            <button onClick={this.onBtnClick}>Click Me</button>
            <script dangerouslySetInnerHTML={{
                __html: 'window.PROPS=' + JSON.stringify({ title: this.props.title } as Props)
            }} />
            <script src="./bundle.js" />
        </body>
      </html>
    );

    return content;
  }
};