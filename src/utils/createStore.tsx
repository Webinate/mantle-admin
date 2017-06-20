import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import { routerMiddleware } from 'react-router-redux';
import { default as rootReducer } from '../store/index';
// import history from './createHistory';

// const router = routerMiddleware( history );
// router;

export default function configureStore( initialState: any ) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware( thunk )
  );
}
