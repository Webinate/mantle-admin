import * as React from 'react';
import { IRootState } from '../store';
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
import { IPost } from '../../../../src';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import PostList from '../components/posts/post-list';
import PostForm from '../components/posts/post-form';
import { GetAllOptions } from '../../../../src/lib-frontend/posts';
import PostFilterBar from '../components/posts/posts-filter-bar';

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

  private onSearch( term: string ) {
    this.props.getPosts( { index: 0, keyword: term } );
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
          renderFilters={() => <PostFilterBar
            onSearch={term => this.onSearch( term )}
            postsSelected={this.state.selectedPosts.length > 0 ? false : true}
            onNew={() => this.props.push( '/dashboard/posts/new' )}
            onDelete={() => this.onDeleteMultiple()}
            isAdminUser={isAdmin ? false : true}
            onFilterToggle={val => this.setState( { filtersOpen: val } )}
            inPostsRoot={inPostsRoot ? true : false}
            filtersOpen={this.state.filtersOpen}
            onCancel={() => this.props.push( '/dashboard/posts' )}
          />}>
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
          <DialogTitle id="form-dialog-title">Delete Post?</DialogTitle>
          <DialogContent className="mt-post-del-dialog">
            <DialogContentText className="mt-post-del-dialog-body">
              {this._selectedPost ?
                `Are you sure you want to delete the post '${ this._selectedPost.title }'?` :
                `Are you sure you want to delete these [${ this.state.selectedPosts.length }] posts?`}
            </DialogContentText>
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