import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { ContentHeader } from '../components/content-header';
import { getPosts, getPost } from '../store/posts/actions';
import { TextField, IconButton, FontIcon, RaisedButton } from 'material-ui';
import { IPost } from 'modepress';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import { PostList } from '../components/posts/post-list';
import { PostForm } from '../components/posts/post-form';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  posts: state.posts,
  app: state.app,
  routing: state.router,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getPosts: getPosts,
  getPost: getPost,
  push: push
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  searchFilter: string;
  selectedPosts: IPost[];
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

  componentDidMount() {
    let match = matchPath<any>( this.props.location.pathname, { exact: true, path: '/dashboard/posts/edit/:postId' } );
    if ( match )
      this.props.getPost( match.params.postId );
    else
      this.props.getPosts();
  }

  render() {
    let page = this.props.posts.postPage;
    let post = this.props.posts.post;
    const isBusy = this.props.posts.busy;

    return (
      <div style={{ height: '100%' }}>
        <ContentHeader
          title="Posts"
          renderFilters={() => {
            return <div>
              <TextField
                className="posts-filter"
                hintText="Filter username or email"
                id="mt-posts-filter"
                value={this.state.searchFilter}
                onKeyDown={e => {
                }}
                onChange={( e, text ) => this.setState( { searchFilter: text } )}
              />,
              <IconButton
                name="posts-search-button"
                style={{ verticalAlign: 'top' }}
                iconStyle={{ color: theme.primary200.background }}
                iconClassName="icon icon-search"
              />,
              <RaisedButton
                onClick={e => this.props.push( '/dashboard/posts/new' )}
                primary={true}
                icon={<FontIcon
                  name="posts-add-post"
                  className="icon icon-add"
                />} label="New Post" />
            </div>
          }}>
        </ContentHeader>
        <PostsContainer>
          <Switch>
            <Route path="/dashboard/posts/new" render={props => <PostForm loading={isBusy} />} />
            <Route path="/dashboard/posts/edit/:postId" render={props => <PostForm loading={isBusy} post={post} />} />
            <Route path="/dashboard/posts" exact={true} render={props => {
              return <PostList
                posts={page}
                loading={isBusy}
                selected={this.state.selectedPosts}
                onEdit={post => this.props.push( `/dashboard/posts/edit/${ post._id }` )}
                onDelete={post => { }}
                onPostSelected={selected => this.setState( { selectedPosts: selected } )}
                getPosts={( index ) => this.props.getPosts( index )}
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