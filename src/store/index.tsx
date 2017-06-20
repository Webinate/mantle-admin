import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import { default as counterReducer, State as ICounterState } from './counter/reducer';

export type IRootState = {
  countState: ICounterState,
  routing: any
};

// Create the root reducer which creates our root state
const rootReducer = combineReducers<IRootState>( {
  countState: counterReducer,
  routing: routing
} );

export default rootReducer;
