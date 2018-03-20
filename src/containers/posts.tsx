import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { ContentHeader } from '../components/content-header';
import { getPosts, ActionCreators } from '../store/posts/actions';
import { TextField, IconButton, FontIcon, RaisedButton } from 'material-ui';
import { Page, IPost } from 'modepress';
import { default as styled } from '../theme/styled';
import TinyPostEditor from '../components/post-editor';
import { Route, Switch } from 'react-router-dom';
import { push } from 'react-router-redux';
import { PostList } from '../components/post-list';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  posts: state.posts,
  app: state.app,
  routing: state.router,
  location: ownProps,
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getPosts: getPosts,
  setPrepopulated: ActionCreators.SetPrepopulated.create,
  push: push
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  searchFilter: string;
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Posts extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      searchFilter: ''
    }
  }

  componentWillMount() {
    if ( !this.props.posts.prepopulated )
      this.props.getPosts();
    else
      this.props.setPrepopulated( false );
  }

  render() {
    let posts: Page<IPost> | null = null;
    const page = this.props.posts.postPage;
    const isBusy = this.props.posts.busy;

    if ( typeof ( page ) !== 'string' )
      posts = page;

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
            <Route path="/dashboard/posts/new" render={props => <TinyPostEditor />} />
            <Route path="/dashboard/posts" exact={true} render={props => {
              return <PostList
                posts={posts}
                loading={isBusy}
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