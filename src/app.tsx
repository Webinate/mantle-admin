import * as React from "react";

export class App extends React.Component<any, any> {
    _handleClick() {
        alert();
    }

    render() {
        return (
            <html>
                <head>
                    <title>Universal App with React</title>
                    <link rel='stylesheet' href='/style.css' />
                </head>
                <body>
                    <div>
                        <h1>Hello World!</h1>
                        <p>Isn't server-side rendering remarkable?</p>
                        <button onClick={this._handleClick}>Click Me</button>
                    </div>
                </body>
            </html>
        );
    }
};