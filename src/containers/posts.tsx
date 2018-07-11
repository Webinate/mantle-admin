import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import ContentHeader from '../components/content-header';
import { getPosts, getPost, createPost, deletePosts, editPost } from '../store/posts/actions';
import { getCategories, createCategory, removeCategory } from '../store/categories/actions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FontCancel from '@material-ui/icons/ArrowBack';
import { IPost } from 'modepress';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import PostList from '../components/posts/post-list';
import PostForm from '../components/posts/post-form';
import FilterIcon from '@material-ui/icons/FilterList';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
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
    const buttonIconStyle: React.CSSProperties = { margin: '0 5px 0 0' };

    return (
      <div style={{ height: '100%' }} className="mt-post-container">
        <ContentHeader
          title="Posts"
          busy={isBusy}
          renderFilters={() => {
            if ( !inPostsRoot ) {
              return (
                <Button
                  style={{ margin: '5px 0 0 0' }}
                  onClick={e => this.props.push( '/dashboard/posts' )}
                >
                  <FontCancel style={buttonIconStyle} />
                  Back
                </Button>
              );
            }
            else
              return (
                <div>
                  <TextField
                    className="posts-filter"
                    placeholder="Filter by title or content"
                    id="mt-posts-filter"
                    value={this.state.searchFilter}
                    onKeyDown={e => {
                      if ( e.keyCode === 13 )
                        this.onSearch();
                    }}
                    onChange={( e ) => this.setState( { searchFilter: e.currentTarget.value } )}
                  />
                  <IconButton
                    className="mt-posts-search"
                    color="primary"
                    onClick={e => this.onSearch()}
                  >
                    <SearchIcon />
                  </IconButton>
                  <Tooltip title={this.state.filtersOpen ? 'Close filter options' : 'Open filter options'}>
                    <IconButton
                      color="primary"
                      className="mt-posts-filter"
                      onClick={e => this.setState( { filtersOpen: !this.state.filtersOpen } )}
                    >
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete selected posts">
                    <IconButton
                      color="primary"
                      className="mt-posts-delete-multi"
                      disabled={this.state.selectedPosts.length > 0 ? false : true}
                      onClick={e => this.onDeleteMultiple()}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    onClick={e => this.props.push( '/dashboard/posts/new' )}
                    className="mt-new-post"
                    disabled={isAdmin ? false : true}
                    color="primary"
                  >
                    <AddIcon style={buttonIconStyle} />
                    New Post
                    </Button>
                </div>
              )
          }}>
        </ContentHeader>
        <PostsContainer>
          <Switch>
            <Route path="/dashboard/posts/new" render={props => <PostForm
              onCreate={post => this.props.createPost( post )}
              isAdmin={isAdmin}
              activeUser={this.props.user!}
            />}
            />
            <Route path="/dashboard/posts/edit/:postId" render={props => <PostForm
              id={props.match.params.postId}
              activeUser={this.props.user!}
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
          open={true}
        >
          <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
          <DialogContent className="mt-post-del-dialog">
            <DialogContentText className="mt-post-del-dialog-body">
              To subscribe to this website, please enter your email address here. We will send
              updates occasionally.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              style={{ margin: '0 5px 0 0', verticalAlign: 'middle' }}
              className="mt-cancel-delpost"
              onClick={e => {
                this._selectedPost = null;
                this.setState( {
                  showDeleteModal: false
                } )
              }}
            >Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
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
            >Yes</Button>
          </DialogActions>
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