import * as React from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import AuthActions from '../store/authentication/actions';
import { State as AuthState } from '../store/authentication/reducer';
import { State as AppState } from '../store/app/reducer';
import { ActionCreators as AppActions } from '../store/app/actions';
import { push } from 'react-router-redux';
import { Route, Redirect, Switch } from 'react-router-dom';
import AuthScreen from '../components/auth-screen';
import Dashboard from '../components/dashboard';
import Home from './home';
import Users from './users';
import Posts from './posts';
import Comments from './comments';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from '@material-ui/core/Snackbar';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { matchPath, useLocation } from 'react-router';
import GroupIcon from '@material-ui/icons/Group';
import MediaLibIcon from '@material-ui/icons/PhotoLibrary';
import CommentIcon from '@material-ui/icons/Comment';
import HomeIcon from '@material-ui/icons/Home';
import PostsIcon from '@material-ui/icons/Description';
import Media from './media';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import { useDispatch } from 'react-redux';

/**
 * The main application entry point
 */
const App: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const auth = useSelector<IRootState, AuthState>((state) => state.authentication);
  const app = useSelector<IRootState, AppState>((state) => state.app);

  const logOut = () => {
    dispatch(AuthActions.logout());
  };

  const goTo = (path: string) => {
    dispatch(push(path));
  };

  // Remove the server-side injected CSS.
  useEffect(() => {
    const jssStyles = document.getElementById('material-styles-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }, []);

  const getAuthScreen = (formType: 'login' | 'register') => {
    return (
      <AuthScreen
        loading={auth.busy}
        error={auth.error}
        activeComponent={formType}
        onLogin={(user, pass) => dispatch(AuthActions.login({ username: user, password: pass, remember: true }))}
        onActivationReset={(user) => {}}
        onPasswordReset={(user) => {}}
        onRegister={(user, email, password) =>
          dispatch(
            AuthActions.register({ username: user, password: password, email: email, activationUrl: '/activate' })
          )
        }
      />
    );
  };

  const iconStyle: React.CSSProperties = { color: 'inherit' };
  const items = [
    {
      label: 'Home',
      icon: <HomeIcon style={iconStyle} />,
      exact: true,
      path: '/dashboard',
      onClick: () => goTo('/dashboard'),
    },
    {
      label: 'Posts',
      icon: <PostsIcon style={iconStyle} />,
      exact: false,
      path: '/dashboard/posts',
      onClick: () => goTo('/dashboard/posts'),
    },
    {
      label: 'Users',
      icon: <GroupIcon style={iconStyle} />,
      exact: false,
      path: '/dashboard/users',
      onClick: () => goTo('/dashboard/users'),
    },
    {
      label: 'Comments',
      icon: <CommentIcon style={iconStyle} />,
      exact: false,
      path: '/dashboard/comments',
      onClick: () => goTo('/dashboard/comments'),
    },
    {
      label: 'Media',
      icon: <MediaLibIcon style={iconStyle} />,
      exact: false,
      path: '/dashboard/media',
      onClick: () => goTo('/dashboard/media'),
    },
  ];

  return (
    <div>
      <CssBaseline />
      <Route path="/" exact={true} render={(props) => <Redirect to="/dashboard" />} />
      <Route
        path="/dashboard"
        render={(props) => {
          return (
            <Dashboard
              animated={app.debugMode ? false : true}
              activeUser={auth.user!}
              title={'Mantle'}
              renderRight={() => <h3>Properties</h3>}
              renderLeft={() => {
                return (
                  <List component="nav" style={{ padding: '0' }}>
                    {items.map((i, index) => {
                      const selected = matchPath(location.pathname, { path: i.path, exact: i.exact });

                      return (
                        <ListItem
                          button
                          className={selected ? 'selected' : ''}
                          key={`menu-item-${index}`}
                          onClick={(e) => i.onClick()}
                        >
                          <ListItemIcon>
                            <Icon>{i.icon}</Icon>
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ color: 'inherit' }} primary={i.label} />
                        </ListItem>
                      );
                    })}
                  </List>
                );
              }}
              onHome={() => goTo('/dashboard')}
              onLogOut={() => logOut()}
            >
              <Switch>
                <Route
                  path="/dashboard"
                  exact={true}
                  render={(props) => {
                    return <Home {...({ location: location } as any)} />;
                  }}
                />
                <Route
                  path="/dashboard/posts"
                  render={(props) => {
                    return <Posts {...({ location: location } as any)} />;
                  }}
                />
                <Route
                  path="/dashboard/users"
                  render={(props) => {
                    return <Users {...({} as any)} />;
                  }}
                />
                <Route
                  path="/dashboard/comments"
                  render={(props) => {
                    return <Comments />;
                  }}
                />
                <Route
                  path="/dashboard/media"
                  render={(props) => {
                    return <Media />;
                  }}
                />
                <Route render={(props) => <h1>Not Found</h1>} />
              </Switch>
            </Dashboard>
          );
        }}
      />
      <Route path="/login" render={(props) => getAuthScreen('login')} />
      <Route path="/register" render={(props) => getAuthScreen('register')} />

      <Snackbar
        className={`mt-response-message ${app.response ? 'mt-snack-open' : 'mt-snack-closed'}`}
        autoHideDuration={20000}
        open={app.response ? true : false}
        onClose={() => {
          dispatch(AppActions.serverResponse.create(null));
        }}
        action={[
          <Button
            key="close-1"
            variant="contained"
            id="mt-close-snackbar-btn"
            onClick={(e) => dispatch(AppActions.serverResponse.create(null))}
          >
            close
          </Button>,
        ]}
        message={<span id="mt-close-snackbar-msg">{app.response || ''}</span>}
      />
    </div>
  );
};

export default App;
