import { combineReducers, ReducersMapObject } from 'redux';
import { routerReducer } from 'react-router-redux';
import { default as usersReducer, State as IUserState } from './users/reducer';
import { default as postsReducer, State as IPostState } from './posts/reducer';
import { default as templatesReducer, State as ITemplateState } from './templates/reducer';
import { default as commentsReducer, State as ICommentState } from './comments/reducer';
import { default as categoriesReducer, State as ICategoryState } from './categories/reducer';
import { default as authReducer, State as IAuthState } from './authentication/reducer';
import { default as adminReducer, State as IAdminState } from './admin-actions/reducer';
import { default as appReducer, State as IAppResponseState } from './app/reducer';
import { default as mediaReducer, State as IMediaResponseState } from './media/reducer';

export type IRootState = {
  users: IUserState,
  posts: IPostState,
  templates: ITemplateState,
  comments: ICommentState,
  categories: ICategoryState,
  authentication: IAuthState,
  admin: IAdminState,
  router: any,
  app: IAppResponseState,
  media: IMediaResponseState
};

// Create the root reducer which creates our root state
const rootReducer = combineReducers<IRootState>( {
  users: usersReducer,
  posts: postsReducer,
  templates: templatesReducer,
  comments: commentsReducer,
  categories: categoriesReducer,
  authentication: authReducer,
  router: routerReducer,
  admin: adminReducer,
  app: appReducer,
  media: mediaReducer
} as ReducersMapObject );

export default rootReducer;
