import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {App, Props} from './components/app';

const props = (window as any).PROPS as Props;

export const app = ReactDOM.render( <App {...props} />, document as any );