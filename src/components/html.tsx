import * as React from 'react';

type Props = {
  html: string;
  styles: any;
  stylesMaterial: any;
  intialData: any;
  agent: string;
}
type State = {
};

/**
 * An html component that represents the entire html page to be rendered
 */
export default class HTML extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
  }

  render() {
    const scripts = [
      '/tiny/tinymce.min.js',
      '/tiny/themes/modern/theme.js',
      '/tiny/plugins/image/plugin.min.js',
      '/tiny/plugins/paste/plugin.min.js',
      '/tiny/plugins/link/plugin.min.js',
      '/tiny/plugins/code/plugin.min.js'
    ];

    const content = (
      <html>
        <head>
          <title>Mantle Example</title>
          <meta charSet="utf-8" />
          <meta name="description" content="" />
          <meta name="HandheldFriendly" content="True" />
          <meta name="MobileOptimized" content="320" />
          <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui" />
          <meta httpEquiv="cleartype" content="on" />

          {scripts.map( ( s, i ) => <script key={`script-${ i }`} type="text/javascript" src={s} /> )}

          <link rel="stylesheet" href="/css/main.css" />
          <link rel="icon" type="image/png" href="/images/favicon.png" />
          <link href="/css/mantle.css" rel="stylesheet" />
          <style id="material-styles-server-side">${this.props.stylesMaterial}</style>
          {this.props.styles}
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