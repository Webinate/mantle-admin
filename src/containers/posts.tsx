import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { ContentHeader } from '../components/content-header';
import { getPosts, getPost, createPost, deletePosts, editPost } from '../store/posts/actions';
import { getCategories, createCategory, removeCategory } from '../store/categories/actions';
import { TextField, IconButton, FontIcon, RaisedButton, FlatButton, Dialog } from 'material-ui';
import FontCancel from 'material-ui/svg-icons/navigation/arrow-back';
import { IPost } from 'modepress';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import { PostList } from '../components/posts/post-list';
import { PostForm } from '../components/posts/post-form';
import FilterIcon from 'material-ui/svg-icons/content/filter-list';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SearchIcon from 'material-ui/svg-icons/action/search';
import { GetAllOptions } from '../../../../src/lib-frontend/posts';

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
  removePost: deletePosts,
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
  showDeleteModal: boolean;
  filtersOpen: boolean;
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Posts extends React.Component<Props, State> {

  private _selectedPost: IPost<'client'> | null;

  constructor( props: Props ) {
    super( props );
    this._selectedPost = null;
    this.state = {
      searchFilter: '',
      selectedPosts: [],
      showDeleteModal: false,
      filtersOpen: false
    }
  }

  private onDelete( post: IPost<'client'> ) {
    this._selectedPost = post;
    this.setState( {
      showDeleteModal: true
    } );
  }

  private onDeleteMultiple() {
    this._selectedPost = null;
    this.setState( {
      showDeleteModal: true
    } );
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
    const headerIconStyle: React.CSSProperties = { verticalAlign: 'top', padding: 0 };

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
                    style={headerIconStyle}
                    className="mt-posts-search"
                    iconStyle={{ color: theme.primary200.background }}
                    onClick={e => this.onSearch()}
                  >
                    <SearchIcon />
                  </IconButton>
                  <IconButton
                    style={headerIconStyle}
                    tooltip={this.state.filtersOpen ? 'Close filter options' : 'Open filter options'}
                    className="mt-posts-filter"
                    onClick={e => this.setState( { filtersOpen: !this.state.filtersOpen } )}
                    iconStyle={{ color: theme.primary200.background }}
                  >
                    <FilterIcon />
                  </IconButton>
                  <IconButton
                    style={headerIconStyle}
                    tooltip="Delete selected posts"
                    className="mt-posts-delete-multi"
                    iconStyle={{ color: theme.primary200.background }}
                    disabled={this.state.selectedPosts.length > 0 ? false : true}
                    onClick={e => this.onDeleteMultiple()}
                  >
                    <DeleteIcon />
                  </IconButton>
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
                filtersOpen={this.state.filtersOpen}
                posts={page}
                loading={isBusy}
                animated={this.props.app.debugMode ? false : true}
                selected={this.state.selectedPosts}
                onEdit={post => this.props.push( `/dashboard/posts/edit/${ post._id }` )}
                onDelete={post => this.onDelete( post )}
                onPostSelected={selected => {
                  this.setState( { selectedPosts: selected } )
                }}
                getPosts={( options: Partial<GetAllOptions> ) => this.props.getPosts( options )}
              />;
            }} />
          </Switch>
        </PostsContainer>

        {this.state.showDeleteModal ? <Dialog
          contentClassName="mt-post-del-dialog"
          bodyClassName="mt-post-del-dialog-body"
          open={true}
          actions={[
            <FlatButton
              label="Cancel"
              style={{ margin: '0 5px 0 0', verticalAlign: 'middle' }}
              className="mt-cancel-delpost"
              onClick={e => {
                this._selectedPost = null;
                this.setState( {
                  showDeleteModal: false
                } )
              }}
            />,
            <RaisedButton
              label="Yes"
              primary={true}
              style={{ verticalAlign: 'middle' }}
              className="mt-confirm-delpost"
              onClick={e => {
                if ( this._selectedPost )
                  this.props.removePost( [ this._selectedPost ] );
                else
                  this.props.removePost( this.state.selectedPosts );

                this.setState( { showDeleteModal: false } )
                this._selectedPost = null;
              }}
            />
          ]}
        >
          {this._selectedPost ?
            `Are you sure you want to delete the post '${ this._selectedPost.title }'?` :
            `Are you sure you want to delete these [${ this.state.selectedPosts.length }] posts?`}
        </Dialog> : undefined}
      </div >
    );
  }
};

const PostsContainer = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;