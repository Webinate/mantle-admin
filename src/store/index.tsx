import { combineReducers, ReducersMapObject } from 'redux';
import { routerReducer } from 'react-router-redux';
import { default as counterReducer, State as ICounterState } from './counter/reducer';

export type IRootState = {
  countState: ICounterState,
  router: any
};

// Create the root reducer which creates our root state
const rootReducer = combineReducers<IRootState>( {
  countState: counterReducer,
  router: routerReducer
} as ReducersMapObject );

export default rootReducer;
