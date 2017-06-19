import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import {App, Props} from './components/app';
import {Routes} from './components/routes';

const props = (window as any).PROPS as Props;

export const app = ReactDOM.render(
  <App {...props}>
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  </App>, document as any );