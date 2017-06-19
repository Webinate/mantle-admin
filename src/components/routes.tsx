import * as React from "react";
import {Route, Link} from "react-router-dom";

const Home = () => {
  return <div>Home</div>
}

const About = () => {
  return <div>About</div>
}

const Topics = () => {
  return <div>Topics</div>
}


export class Routes extends React.Component<any, any> {

  render() {
    return <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/topics">Topics</Link></li>
      </ul>

      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/topics" component={Topics}/>
    </div>
  }
}