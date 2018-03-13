import * as React from 'react';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { ContentHeader } from '../components/content-header';
import { getPosts, ActionCreators } from '../store/posts/actions';
import { TextField, IconButton, LinearProgress, Avatar, FloatingActionButton, FontIcon } from 'material-ui';
import { Pager } from '../components/pager';
import { Page, IPost } from 'modepress';
import * as moment from 'moment';
import { default as styled } from '../theme/styled';
import { generateAvatarPic } from '../utils/component-utils';
import TinyPostEditor from '../components/post-editor';
import { Route, Switch } from 'react-router-dom';
import { push } from 'react-router-redux';

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

  componentWillMount() {
    if ( !this.props.posts.prepopulated )
      this.props.getPosts();
    else
      this.props.setPrepopulated( false );
  }

  private onPostSelected( post: IPost, e: React.MouseEvent<HTMLDivElement> ) {
    e.preventDefault();
    e.stopPropagation();

    if ( !e.ctrlKey && !e.shiftKey ) {
      this.setState( { selectedPosts: [ post ] } );
    }
    else if ( e.ctrlKey ) {
      if ( this.state.selectedPosts.indexOf( post ) === -1 )
        this.setState( { selectedPosts: this.state.selectedPosts.concat( post ) } );
      else
        this.setState( { selectedPosts: this.state.selectedPosts.filter( i => i !== post ) } );
    }
    else {
      const postPage = this.props.posts.postPage!;
      const selected = this.state.selectedPosts;

      let firstIndex = Math.min( postPage.data.indexOf( post ), selected.length > 0 ? postPage.data.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( postPage.data.indexOf( post ), selected.length > 0 ? postPage.data.indexOf( selected[ 0 ] ) : 0 );

      this.setState( { selectedPosts: postPage.data.slice( firstIndex, lastIndex + 1 ) } );
    }
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
              />
              <IconButton
                name="posts-search-button"
                style={{ verticalAlign: 'top' }}
                iconStyle={{ color: theme.primary200.background }}
                iconClassName="icon icon-search"
              />
              <FloatingActionButton style={{ verticalAlign: 'top' }} mini={true} onClick={e => this.props.push( '/dashboard/posts/new' )}>
                <FontIcon
                  name="posts-add-post"
                  className="icon icon-add"
                />
              </FloatingActionButton>
            </div>
          }}>
        </ContentHeader>
        <div style={{ padding: '10px' }}>
          <Switch>
            <Route path="/dashboard/posts/new" render={props => <TinyPostEditor />} />
            <Route path="/dashboard/posts" exact={true} render={props => {
              return (
                <div>
                  {posts ? <Pager
                    total={posts!.count}
                    limit={posts!.limit}
                    offset={posts!.index}
                    onPage={index => this.props.getPosts( index )}
                  >
                    {isBusy ? <div className="mt-loading"><LinearProgress /></div> : undefined}
                    <PostsContainer className="mt-posts">
                      {posts.data.map( ( post, postIndex ) => {
                        const selected = this.state.selectedPosts.indexOf( post ) === -1 ? false : true;
                        return <Post
                          key={'post-' + postIndex}
                          selected={selected}
                          className="mt-post"
                          onClick={e => { this.onPostSelected( post, e ) }}
                        >
                          <IconButton
                            style={{ top: 0, right: '30px', position: 'absolute' }}
                            iconStyle={{ color: theme.primary200.background }}
                            className="mt-post-button"
                            iconClassName="icon icon-edit"
                          />
                          <IconButton
                            style={{ top: 0, right: 0, position: 'absolute' }}
                            iconStyle={{ color: theme.primary200.background }}
                            className="mt-post-button"
                            iconClassName="icon icon-delete"
                          />
                          <div className="mt-post-content">{post.content}</div>
                          <div className="mt-post-dates">
                            <i>{moment( post.lastUpdated ).format( 'MMM Do, YYYY' )}</i>
                            <i>{moment( post.createdOn ).format( 'MMM Do, YYYY' )}</i>
                          </div>
                          <div className="mt-post-info">
                            <Avatar
                              src={generateAvatarPic( post.author ? post.author.avatar : '' )}
                              size={60}
                              style={{ float: 'right' }}
                            />
                            <h3 className="mt-post-name">{post.title || 'UNTITLED'}</h3>
                          </div>
                        </Post>
                      } )}
                    </PostsContainer>
                  </Pager> : undefined}
                </div>
              );
            }} />
          </Switch>
        </div>
      </div >
    );
  }
};

interface PostProps extends React.HTMLProps<HTMLDivElement> {
}

const PostsContainer = styled.div`
  height: 100%;
`;

const Post = styled.div`
  margin: 10px;
  float: left;
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.25s background;
  width: 300px;
  height: 300px;
  background: ${( props: PostProps ) => props.selected ? theme.primary200.background : theme.light300.background };
  color: ${( props: PostProps ) => props.selected ? theme.primary200.color : '' };
  user-select: none;
  position: relative;

  &:hover {
    background: ${( props: PostProps ) => props.selected ? '' : theme.light400.background };
    color: ${( props: PostProps ) => props.selected ? '' : theme.light400.color };

    .mt-post-button {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mt-post-info {
    clear: both;
    > h3 {
      display: inline-block;
    }
  }

  .mt-post-dates {
    padding: 5px 0 0 0;
    border-top: 1px solid #ccc;

    i:first-child { float: left; }
    i:last-child { float: right; }
  }

  &:active {
    background: ${( props: PostProps ) => props.selected ? '' : theme.light100.background };
    color: ${( props: PostProps ) => props.selected ? '' : theme.light100.color };
  }

  .mt-post-button {
    opacity: 0;
    transform: translateY(-15px);
  }

  .mt-post-content {
    height: 200px;
    background: ${( props: PostProps ) => props.selected ? theme.light100.background : theme.light100.background };
    color: ${( props: PostProps ) => props.selected ? theme.light100.color : '' };
  }

  h3 {
    padding: 5px 0 0 0;
    clear: both;
  }
`;