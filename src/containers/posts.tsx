import * as React from 'react';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import ContentHeader from '../components/content-header';
import { getPosts, getPost, createPost, deletePosts, editPost, addElement, changeTemplate, updateElement, deleteElements, ActionCreators as PostCreators } from '../store/posts/actions';
import { getCategories, createCategory, removeCategory } from '../store/categories/actions';
import { getComments, createComment, editComment, deleteComment } from '../store/comments/actions';
import { getAllTemplates } from '../store/templates/actions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { IPost, IDocument } from '../../../../src';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import PostList from '../components/posts/post-list';
import PostForm from '../components/posts/post-form';
import PostFilterBar from '../components/posts/posts-filter-bar';
import NewComment from '../components/comments/new-comment';
import { CommentsList } from '../components/comments/comments-list';
import PostPreview from '../components/posts/post-preview';
import { randomId } from '../utils/misc';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  posts: state.posts,
  comments: state.comments,
  categories: state.categories,
  user: state.authentication.user,
  app: state.app,
  routing: state.router,
  templates: state.templates,
  categoriesLoading: state.categories.busy,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getPosts,
  getCategories,
  getPost,
  createPost,
  removePost: deletePosts,
  createCategory,
  removeCategory,
  editPost,
  push,
  getComments,
  createComment,
  addElement,
  updateElement,
  editComment,
  deleteComment,
  getAllTemplates,
  changeTemplate,
  deleteElements,
  setElmSelection: PostCreators.SetElmSelection.create
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

  componentDidMount() {
    this.props.getAllTemplates();
    this.props.getPosts( {
      index: 0,
      sortOrder: this.props.posts.postFilters.sortOrder,
      visibility: this.props.posts.postFilters.visibility,
      author: '',
      sort: this.props.posts.postFilters.sort
    } );
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.location.pathname !== this.props.location.pathname ) {
      const inPostsRoot = matchPath( next.location.pathname, { exact: true, path: '/dashboard/posts' } );

      if ( inPostsRoot ) {
        this.props.getPosts( {
          index: 0,
          sortOrder: this.props.posts.postFilters.sortOrder,
          visibility: this.props.posts.postFilters.visibility,
          author: '',
          sort: this.props.posts.postFilters.sort
        } );
      }
      else {
        const matches = matchPath<{ postId: string }>( next.location.pathname, { exact: true, path: '/dashboard/posts/edit/:postId' } );
        this.props.getPost( matches!.params.postId );
        this.props.getCategories();
      }
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

  private renderComment( postId: string ) {
    const commentsPage = this.props.comments.commentPage;
    const user = this.props.user!;

    return <div>
      <NewComment
        auth={user}
        enabled={!this.props.comments.busy}
        onNewComment={comment => this.props.createComment( postId, { content: comment } )}
      />
      <CommentsList
        page={commentsPage}
        selectable={false}
        onReply={( post, parent, comment ) => this.props.createComment( post, comment, parent )}
        auth={this.props.user!}
        onEdit={( id, token ) => this.props.editComment( id, token )}
        loading={this.props.comments.busy}
        getAll={options => this.props.getComments( { ...options, postId: postId } )}
        onDelete={id => this.props.deleteComment( id )}
      />
    </div>
  }

  render() {
    const page = this.props.posts.postPage;
    const post = this.props.posts.post;
    const isBusy = this.props.posts.busy;
    const isAdmin = this.props.user && this.props.user.privileges < 2 ? true : false;
    const inPostsRoot = matchPath( this.props.location.pathname, { exact: true, path: '/dashboard/posts' } );
    const user = this.props.user!;
    const templates = this.props.templates;

    return (
      <div style={{ height: '100%' }} className="mt-post-container">
        <ContentHeader
          title="Posts"
          busy={isBusy}
          renderFilters={() => <PostFilterBar
            loading={isBusy}
            onSearch={term => this.onSearch( term )}
            postsSelected={this.state.selectedPosts.length > 0 ? false : true}
            onNew={() => this.props.createPost( { title: 'New Post', slug: randomId() } )}
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
            <Route path="/dashboard/posts/edit/:postId" exact={true} render={props => {
              if ( !post )
                return null;

              if ( isAdmin || ( post && user._id === post._id ) ) {
                const doc = post.document as IDocument<'client'>;

                return <PostForm
                  id={props.match.params.postId}
                  animated={this.props.app.debugMode ? false : true}
                  activeUser={user}
                  categoriesLoading={this.props.categoriesLoading}
                  templates={templates}
                  onTemplateChanged={( templateId ) => this.props.changeTemplate( doc._id, templateId )}
                  post={post}
                  elements={this.props.posts.draftElements!}
                  onUpdate={post => this.props.editPost( post )}
                  isAdmin={isAdmin}
                  renderAfterForm={() => this.renderComment( props.match.params.postId )}
                  onCreateElm={( ( elm, index ) => this.props.addElement( doc._id, elm, index ) )}
                  onUpdateElm={( id, html, createElement, deselect ) => this.props.updateElement( doc._id, id, html, createElement, deselect )}
                  onDeleteElements={ids => this.props.deleteElements( doc._id, ids )}
                  onSelectionChanged={selection => this.props.setElmSelection( selection )}
                  selectedElements={this.props.posts.selection}
                />
              }
              else {
                return <PostPreview
                  post={post}
                  loading={isBusy}
                  id={props.match.params.postId}
                  renderComments={() => this.renderComment( props.match.params.postId )}
                />
              }
            }}
            />
            <Route path="/dashboard/posts" exact={true} render={props => {
              return <PostList
                filtersOpen={this.state.filtersOpen}
                postFilters={this.props.posts.postFilters}
                posts={page}
                loading={isBusy}
                animated={this.props.app.debugMode ? false : true}
                selected={this.state.selectedPosts}
                onEdit={post => this.props.push( `/dashboard/posts/edit/${ post._id }` )}
                onDelete={post => this.onDelete( post )}
                onPostSelected={selected => {
                  this.setState( { selectedPosts: selected } )
                }}
                getPosts={( options ) => this.props.getPosts( options )}
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