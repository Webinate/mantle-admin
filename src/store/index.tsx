import { combineReducers, ReducersMapObject } from 'redux';
import { routerReducer } from 'react-router-redux';
import { default as counterReducer, State as ICounterState } from './counter/reducer';
import { default as authReducer, State as IAuthState } from './authentication/reducer';

export type IRootState = {
  countState: ICounterState,
  authentication: IAuthState,
  router: any
};

// Create the root reducer which creates our root state
const rootReducer = combineReducers<IRootState>( {
  countState: counterReducer,
  authentication: authReducer,
  router: routerReducer
} as ReducersMapObject );

export default rootReducer;
