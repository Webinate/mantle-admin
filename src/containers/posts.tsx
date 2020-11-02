import * as React from 'react';
import { useState, useEffect } from 'react';
import { IRootState } from '../store';
import ContentHeader from '../components/content-header';
import {
  getPosts,
  getPost,
  createPost,
  deletePosts,
  editPost,
  addElement,
  changeTemplate,
  updateElement,
  deleteElements,
  ActionCreators as PostCreators,
} from '../store/posts/actions';
import categoryActions from '../store/categories/actions';
import commentActions from '../store/comments/actions';
import { getAllTemplates } from '../store/templates/actions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { Post, User } from 'mantle';
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
import { State as AppState } from '../store/app/reducer';
import { State as PostsState } from '../store/posts/reducer';
import { State as CommentsState } from '../store/comments/reducer';
import { State as CategoriesState } from '../store/categories/reducer';
import { State as TemplatesStates } from '../store/templates/reducer';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

/**
 * The main application entry point
 */
const Posts: React.FC<void> = (props) => {
  const [selectedPosts, setSelectedPosts] = useState<Post[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const dispatch = useDispatch();
  const posts = useSelector<IRootState, PostsState>((state) => state.posts);
  const comments = useSelector<IRootState, CommentsState>((state) => state.comments);
  const app = useSelector<IRootState, AppState>((state) => state.app);
  const user = useSelector<IRootState, User | null>((state) => state.authentication.user);
  const categories = useSelector<IRootState, CategoriesState>((state) => state.categories);
  const templates = useSelector<IRootState, TemplatesStates>((state) => state.templates);
  let _selectedPost: Post | undefined;
  let location = useLocation();

  useEffect(() => {
    const inPostsRoot = matchPath(location.pathname, { exact: true, path: '/dashboard/posts' });
    setPreviewMode(false);

    if (inPostsRoot) {
      dispatch(
        getPosts({
          index: 0,
          sortOrder: posts.postFilters.sortOrder,
          visibility: posts.postFilters.visibility,
          author: '',
          sortType: posts.postFilters.sortType,
        })
      );
    } else {
      const matches = matchPath<{ postId: string }>(location.pathname, {
        exact: true,
        path: '/dashboard/posts/edit/:postId',
      });
      dispatch(getAllTemplates());
      dispatch(getPost(matches!.params.postId));
      dispatch(categoryActions.getCategories({}));
    }
  }, [dispatch, location]);

  // useEffect(() => {
  //   const inPostsRoot = matchPath(location.pathname, { exact: true, path: '/dashboard/posts' });
  //   setPreviewMode(false);

  //   if (inPostsRoot) {
  //     dispatch(
  //       getPosts({
  //         index: 0,
  //         sortOrder: posts.postFilters.sortOrder,
  //         visibility: posts.postFilters.visibility,
  //         author: '',
  //         sortType: posts.postFilters.sortType,
  //       })
  //     );
  //   } else {
  //     const matches = matchPath<{ postId: string }>(location.pathname, {
  //       exact: true,
  //       path: '/dashboard/posts/edit/:postId',
  //     });
  //     dispatch(getPost(matches!.params.postId));
  //     dispatch(categoryActions.getCategories());
  //   }
  // }, [location]);

  const onDeleteMultiple = () => {
    _selectedPost = undefined;
    setShowDeleteModal(true);
  };

  const onDelete = (post: Post) => {
    _selectedPost = post;
    setShowDeleteModal(true);
  };

  const onSearch = (term: string) => {
    dispatch(getPosts({ index: 0, keyword: term }));
  };

  const renderComment = (postId: string) => {
    const commentsPage = comments.commentPage;

    return (
      <div>
        <NewComment
          auth={user!}
          enabled={!comments.busy}
          onNewComment={(comment) => dispatch(commentActions.createComment({ content: comment, post: postId }))}
        />
        <CommentsList
          page={commentsPage}
          selectable={false}
          onReply={(post, parent, comment) => dispatch(commentActions.createComment(comment, parent))}
          auth={user!}
          onEdit={(token) => dispatch(commentActions.editComment(token))}
          loading={comments.busy}
          getAll={(options) => dispatch(commentActions.getComments({ ...options, postId: postId }))}
          onDelete={(id) => dispatch(commentActions.deleteComment(id))}
        />
      </div>
    );
  };

  const page = posts.postPage;
  const post = posts.post;
  const isBusy = posts.busy;
  const isAdmin = user && user.privileges !== 'regular' ? true : false;
  const inPostsRoot = matchPath(location.pathname, { exact: true, path: '/dashboard/posts' });

  _selectedPost;

  return (
    <div style={{ height: '100%' }} className="mt-post-container">
      <ContentHeader
        title="Posts"
        busy={isBusy}
        renderFilters={() => (
          <PostFilterBar
            loading={isBusy}
            onSearch={(term) => onSearch(term)}
            postsSelected={selectedPosts.length > 0 ? false : true}
            onNew={() => dispatch(createPost({ title: 'New Post', slug: randomId() }))}
            onDelete={() => onDeleteMultiple()}
            isAdminUser={isAdmin ? false : true}
            onFilterToggle={(val) => setFiltersOpen(val)}
            inPostsRoot={inPostsRoot ? true : false}
            filtersOpen={filtersOpen}
            onCancel={() => {
              if (previewMode) setPreviewMode(false);
              else dispatch(push('/dashboard/posts'));
            }}
          />
        )}
      />
      <PostsContainer>
        <Switch>
          <Route
            path="/dashboard/posts/edit/:postId"
            exact={true}
            render={(props) => {
              if (!post) return null;

              if (!previewMode && (isAdmin || (post && user!._id === post._id))) {
                const doc = post.document;

                return (
                  <PostForm
                    id={props.match.params.postId}
                    animated={app.debugMode ? false : true}
                    activeUser={user!}
                    categoriesLoading={categories.busy}
                    templates={templates}
                    onTemplateChanged={(templateId) => dispatch(changeTemplate(doc._id as string, templateId))}
                    post={post}
                    elements={posts.elements!}
                    onUpdate={(post) => dispatch(editPost(post))}
                    isAdmin={isAdmin}
                    onRequestPreview={() => setPreviewMode(true)}
                    renderAfterForm={() => renderComment(props.match.params.postId)}
                    onCreateElm={(elms, index) => dispatch(addElement(doc._id as string, elms, index))}
                    onUpdateElm={(token, createElement, deselect) =>
                      dispatch(updateElement(doc._id as string, token, createElement, deselect))
                    }
                    onDeleteElements={(ids) => dispatch(deleteElements(doc._id as string, ids))}
                    onSelectionChanged={(selection, focus) => {
                      dispatch(PostCreators.SetElmSelection.create(selection));
                      if (focus && selection.length > 0) dispatch(PostCreators.SetFocussedElm.create(selection[0]));
                    }}
                    selectedElements={posts.selection}
                    focussedId={posts.focussedId}
                  />
                );
              } else {
                return (
                  <PostPreview
                    post={post._id}
                    loading={isBusy}
                    id={props.match.params.postId}
                    renderComments={() => renderComment(props.match.params.postId)}
                  />
                );
              }
            }}
          />
          <Route
            path="/dashboard/posts"
            exact={true}
            render={(props) => {
              return (
                <PostList
                  filtersOpen={filtersOpen}
                  postFilters={posts.postFilters}
                  posts={page}
                  loading={isBusy}
                  animated={app.debugMode ? false : true}
                  selected={selectedPosts}
                  onEdit={(post) => dispatch(push(`/dashboard/posts/edit/${post._id}`))}
                  onDelete={(post) => onDelete(post)}
                  onPostSelected={(selected) => {
                    setSelectedPosts(selected);
                  }}
                  getPosts={(options) => dispatch(getPosts(options))}
                />
              );
            }}
          />
        </Switch>
      </PostsContainer>

      {showDeleteModal ? (
        <Dialog open={true}>
          <DialogTitle id="form-dialog-title">Delete Post?</DialogTitle>
          <DialogContent className="mt-post-del-dialog">
            <DialogContentText className="mt-post-del-dialog-body">
              {_selectedPost
                ? `Are you sure you want to delete the post '${_selectedPost.title}'?`
                : `Are you sure you want to delete these [${selectedPosts.length}] posts?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              style={{ margin: '0 5px 0 0', verticalAlign: 'middle' }}
              className="mt-cancel-delpost"
              onClick={(e) => {
                _selectedPost = undefined;
                setShowDeleteModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ verticalAlign: 'middle' }}
              className="mt-confirm-delpost"
              onClick={(e) => {
                if (_selectedPost) dispatch(deletePosts([_selectedPost]));
                else dispatch(deletePosts(selectedPosts));

                setShowDeleteModal(false);
                _selectedPost = undefined;
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      ) : undefined}
    </div>
  );
};

export default Posts;

const PostsContainer = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;
