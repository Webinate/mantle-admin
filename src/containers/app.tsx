import * as React from 'react';
import { IRootState } from '../store';
import AuthActions from '../store/authentication/actions';
import { ActionCreators as AppActions } from '../store/app/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { push } from 'react-router-redux';
import { Route, Redirect, Switch } from 'react-router-dom';
import AuthScreen from '../components/auth-screen';
import Dashboard from '../components/dashboard';
import { Home } from './home';
import { Users } from './users';
import { Posts } from './posts';
import { Comments } from './comments';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from '@material-ui/core/Snackbar';
import Icon from '@material-ui/core/Icon';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { matchPath } from 'react-router';
import GroupIcon from '@material-ui/icons/Group';
import MediaLibIcon from '@material-ui/icons/PhotoLibrary';
import CommentIcon from '@material-ui/icons/Comment';
import HomeIcon from '@material-ui/icons/Home';
import PostsIcon from '@material-ui/icons/Description';
import { Media } from './media';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';

// Map state to props
const mapStateToProps = (state: IRootState, ownProps: any) => ({
  userState: state.users,
  auth: state.authentication,
  routing: state.router,
  location: ownProps,
  app: state.app,
});

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  push: push,
  login: AuthActions.login,
  register: AuthActions.register,
  logout: AuthActions.logout,
  closeSnackbar: AppActions.serverResponse.create,
};

const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & typeof dispatchToProps;
type State = {};

/**
 * The main application entry point
 */
@connectWrapper(mapStateToProps, dispatchToProps)
export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private logOut() {
    this.setState({ menuOpen: false });
    this.props.logout();
  }

  private goTo(path: string) {
    this.setState({ menuOpen: false });
    this.props.push(path);
  }

  // Remove the server-side injected CSS.
  componentDidMount() {
    const jssStyles = document.getElementById('material-styles-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  getAuthScreen(formType: 'login' | 'register') {
    return (
      <AuthScreen
        loading={this.props.auth.busy}
        error={this.props.auth.error}
        activeComponent={formType}
        onLogin={(user, pass) => this.props.login({ username: user, password: pass, remember: true })}
        onActivationReset={(user) => {}}
        onPasswordReset={(user) => {}}
        onRegister={(user, email, password) =>
          this.props.register({ username: user, password: password, email: email, activationUrl: '/activate' })
        }
      />
    );
  }

  render() {
    const iconStyle: React.CSSProperties = { color: 'inherit' };
    const items = [
      {
        label: 'Home',
        icon: <HomeIcon style={iconStyle} />,
        exact: true,
        path: '/dashboard',
        onClick: () => this.goTo('/dashboard'),
      },
      {
        label: 'Posts',
        icon: <PostsIcon style={iconStyle} />,
        exact: false,
        path: '/dashboard/posts',
        onClick: () => this.goTo('/dashboard/posts'),
      },
      {
        label: 'Users',
        icon: <GroupIcon style={iconStyle} />,
        exact: false,
        path: '/dashboard/users',
        onClick: () => this.goTo('/dashboard/users'),
      },
      {
        label: 'Comments',
        icon: <CommentIcon style={iconStyle} />,
        exact: false,
        path: '/dashboard/comments',
        onClick: () => this.goTo('/dashboard/comments'),
      },
      {
        label: 'Media',
        icon: <MediaLibIcon style={iconStyle} />,
        exact: false,
        path: '/dashboard/media',
        onClick: () => this.goTo('/dashboard/media'),
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
                animated={this.props.app.debugMode ? false : true}
                activeUser={this.props.auth.user!}
                title={'Mantle'}
                renderRight={() => <h3>Properties</h3>}
                renderLeft={() => {
                  return (
                    <List component="nav" style={{ padding: '0' }}>
                      {items.map((i, index) => {
                        const selected = matchPath(props.location.pathname, { path: i.path, exact: i.exact });

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
                onHome={() => this.goTo('/dashboard')}
                onLogOut={() => this.logOut()}
              >
                <Switch>
                  <Route
                    path="/dashboard"
                    exact={true}
                    render={(props) => {
                      return <Home {...({ location: props.location } as any)} />;
                    }}
                  />
                  <Route
                    path="/dashboard/posts"
                    render={(props) => {
                      return <Posts {...({ location: props.location } as any)} />;
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
                      return <Comments {...({ location: props.location } as any)} />;
                    }}
                  />
                  <Route
                    path="/dashboard/media"
                    render={(props) => {
                      return <Media {...({ location: props.location } as any)} />;
                    }}
                  />
                  <Route render={(props) => <h1>Not Found</h1>} />
                </Switch>
              </Dashboard>
            );
          }}
        />
        <Route path="/login" render={(props) => this.getAuthScreen('login')} />
        <Route path="/register" render={(props) => this.getAuthScreen('register')} />

        <Snackbar
          className={`mt-response-message ${this.props.app.response ? 'mt-snack-open' : 'mt-snack-closed'}`}
          autoHideDuration={20000}
          open={this.props.app.response ? true : false}
          onClose={() => {
            this.props.closeSnackbar(null);
          }}
          action={[
            <Button
              key="close-1"
              variant="contained"
              id="mt-close-snackbar-btn"
              onClick={(e) => this.props.closeSnackbar(null)}
            >
              close
            </Button>,
          ]}
          message={<span id="mt-close-snackbar-msg">{this.props.app.response || ''}</span>}
        />
      </div>
    );
  }
}
