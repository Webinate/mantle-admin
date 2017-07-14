import * as React from "react";
import { Route, Link } from "react-router-dom";

const Home = () => {
  return <div>Home</div>
}

const About = () => {
  return <div>About</div>
}

const Topics = () => {
  return <div>Topics</div>
}

class CustomLink extends React.Component<{ label: string, to: string, activeOnlyWhenExact?: boolean }, {}> {
  render() {
    return <Route path={this.props.to} exact={this.props.activeOnlyWhenExact} children={( { match } ) => {
      return (
        <div className={match ? 'active' : ''}>
          {match ? '> ' : ''}<Link to={this.props.to}>{this.props.label}</Link>
        </div>
      )
    }} />
  }
}

export class Routes extends React.Component<{ onGoTo: ( path: string ) => void }, any> {

  render() {
    return <div>
      <ul>
        <li><CustomLink activeOnlyWhenExact={true} to="/" label="Home" /></li>
        <li><CustomLink to="/about" label="About" /></li>
        <li><CustomLink to="/topics" label="Topics" /></li>

        <button onClick={e => {
          this.props.onGoTo( '/topics' );
        }}>Programatically go to topics</button>
      </ul>

      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
    </div>
  }
}