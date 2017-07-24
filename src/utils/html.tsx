import * as React from "react";

type Props = {
  html: string;
  intialData: any;
  agent: string;
}
type State = {
};

/**
 * The main application entry point
 */
export class HTML extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
  }

  render() {
    const content = (
      <html>
        <head>
          <title>Modepress Example</title>
          <meta charSet="utf-8" />
          <meta name="description" content="" />
          <meta name="HandheldFriendly" content="True" />
          <meta name="MobileOptimized" content="320" />
          <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui" />
          <meta httpEquiv="cleartype" content="on" />
          <link rel='stylesheet' href='/css/main.css' />
          <link rel="icon" type="image/png" href="/images/favicon.png" />
          <link href="/css/font-awesome.css" rel="stylesheet" />
        </head>
        <body>
          <div id="application"
            dangerouslySetInnerHTML={{ __html: this.props.html }}
          />
          <script dangerouslySetInnerHTML={{
            __html: `window.PROPS=${ JSON.stringify( this.props.intialData ).replace( /</g, '\\u003c' ) }`
          }} />
          <script dangerouslySetInnerHTML={{
            __html: `window.AGENT=${ JSON.stringify( this.props.agent ) }`
          }} />


          <script src="/bundle.js" />
        </body>
      </html>
    );

    return content;
  }
};