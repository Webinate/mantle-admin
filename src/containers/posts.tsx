import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { ContentHeader } from '../components/content-header';
import { getPosts, getPost, createPost, deletePost, editPost } from '../store/posts/actions';
import { getCategories, createCategory, removeCategory } from '../store/categories/actions';
import { TextField, IconButton, FontIcon, RaisedButton, FlatButton } from 'material-ui';
import FontCancel from 'material-ui/svg-icons/navigation/arrow-back';
import { IPost } from 'modepress';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import { PostList } from '../components/posts/post-list';
import { PostForm } from '../components/posts/post-form';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  posts: state.posts,
  categories: state.categories,
  user: state.authentication.user,
  app: state.app,
  routing: state.router,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getPosts: getPosts,
  getCategories: getCategories,
  getPost: getPost,
  createPost: createPost,
  removePost: deletePost,
  createCategory: createCategory,
  removeCategory: removeCategory,
  editPost: editPost,
  push: push
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  searchFilter: string;
  selectedPosts: IPost<'client'>[];
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Posts extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      searchFilter: '',
      selectedPosts: []
    }
  }

  private onSearch() {
    this.props.getPosts( { index: 0, keyword: this.state.searchFilter } );
  }

  render() {
    let page = this.props.posts.postPage;
    let post = this.props.posts.post;
    const isBusy = this.props.posts.busy;
    const isAdmin = this.props.user && this.props.user.privileges < 2 ? true : false;
    const inPostsRoot = matchPath( this.props.location.pathname, { exact: true, path: '/dashboard/posts' } );

    return (
      <div style={{ height: '100%' }} className="mt-post-container">
        <ContentHeader
          title="Posts"
          busy={isBusy}
          renderFilters={() => {
            if ( !inPostsRoot ) {
              return (
                <FlatButton
                  style={{ margin: '5px 0 0 0' }}
                  onClick={e => this.props.push( '/dashboard/posts' )}
                  icon={<FontCancel />}
                  label="Back"
                />
              );
            }
            else
              return (
                <div>
                  <TextField
                    className="posts-filter"
                    hintText="Filter by title or content"
                    id="mt-posts-filter"
                    value={this.state.searchFilter}
                    onKeyDown={e => {
                      if ( e.keyCode === 13 )
                        this.onSearch();
                    }}
                    onChange={( e, text ) => this.setState( { searchFilter: text } )}
                  />
                  <IconButton
                    style={{ verticalAlign: 'top' }}
                    iconStyle={{ color: theme.primary200.background }}
                    iconClassName="icon icon-search"
                    onClick={e => this.onSearch()}
                  />
                  <RaisedButton
                    onClick={e => this.props.push( '/dashboard/posts/new' )}
                    className="mt-new-post"
                    disabled={isAdmin ? false : true}
                    primary={true}
                    icon={<FontIcon
                      className="icon icon-add"
                    />} label="New Post" />
                </div>
              )
          }}>
        </ContentHeader>
        <PostsContainer>
          <Switch>
            <Route path="/dashboard/posts/new" render={props => <PostForm
              onCreate={post => this.props.createPost( post )}
              isAdmin={isAdmin}
            />}
            />
            <Route path="/dashboard/posts/edit/:postId" render={props => <PostForm
              id={props.match.params.postId}
              onFetch={id => {
                this.props.getPost( id );
                this.props.getCategories();
              }}
              post={post}
              onUpdate={post => this.props.editPost( post )}
              isAdmin={isAdmin}
            />}
            />
            <Route path="/dashboard/posts" exact={true} render={props => {
              return <PostList
                posts={page}
                animated={!this.props.app.debugMode}
                selected={this.state.selectedPosts}
                onEdit={post => this.props.push( `/dashboard/posts/edit/${ post._id }` )}
                onDelete={post => this.props.removePost( post )}
                onPostSelected={selected => this.setState( { selectedPosts: selected } )}
                getPosts={( index ) => this.props.getPosts( { index: index, keyword: this.state.searchFilter } )}
              />;
            }} />
          </Switch>
        </PostsContainer>
      </div >
    );
  }
};

const PostsContainer = styled.div`
  overflow: auto;
  padding: 10px;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;