import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import Pager from '../pager';
import { Post, User, PaginatedPostsResponse, PostVisibility, PostSortType, QueryPostsArgs } from 'mantle';
import format from 'date-fns/format';
import { default as styled } from '../../theme/styled';
import { generateAvatarPic } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Create';
import UserPicker from '../user-picker';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowUpIcon from '@material-ui/icons/ArrowDropUp';

export type Props = {
  animated: boolean;
  loading: boolean;
  posts: PaginatedPostsResponse | null;
  getPosts: (options: Partial<QueryPostsArgs>) => void;
  postFilters: Partial<QueryPostsArgs>;
  onPostSelected: (post: Post[]) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  selected: Post[];
  filtersOpen: boolean;
};

export type State = {
  showDeleteModal: boolean;
  sortAscending: boolean;
  user: User | null;
  visibility: PostVisibility;
  sortBy: PostSortType;
  visibilityOpen: boolean;
  sortByOpen: boolean;
};

export default class PostList extends React.Component<Props, State> {
  private _container: React.RefObject<HTMLDivElement>;
  private _sortElm?: HTMLElement | null;
  private _visibilityElm?: HTMLElement | null;

  constructor(props: Props) {
    super(props);
    this._container = React.createRef();
    this.state = {
      showDeleteModal: false,
      sortAscending: props.postFilters.sortOrder && props.postFilters.sortOrder === 'asc' ? true : false,
      visibility: 'all',
      sortBy: props.postFilters.sortType ? props.postFilters.sortType : 'created',
      user: null,
      visibilityOpen: false,
      sortByOpen: false,
    };
  }

  componentWillReceiveProps(next: Props) {
    if (next.posts !== this.props.posts) this.props.onPostSelected([]);
  }

  private onPostSelected(post: Post, e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!e.ctrlKey && !e.shiftKey) {
      this.props.onPostSelected([post]);
    } else if (e.ctrlKey) {
      if (this.props.selected.indexOf(post) === -1) this.props.onPostSelected(this.props.selected.concat(post));
      else this.props.onPostSelected(this.props.selected.filter((i) => i !== post));
    } else {
      const postPage = this.props.posts!;
      const selected = this.props.selected;

      let firstIndex = Math.min(
        postPage.data.indexOf(post),
        selected.length > 0 ? postPage.data.indexOf(selected[0]) : 0
      );
      let lastIndex = Math.max(
        postPage.data.indexOf(post),
        selected.length > 0 ? postPage.data.indexOf(selected[0]) : 0
      );

      this.props.onPostSelected(postPage.data.slice(firstIndex, lastIndex + 1));
    }
  }

  private onAscChange() {
    const val = !this.state.sortAscending;
    this.setState({ sortAscending: val, sortByOpen: false }, () => {
      this.props.getPosts({
        sortOrder: val ? 'asc' : 'desc',
      });
    });
  }

  private onVisibilityChange(visibility: PostVisibility) {
    this.setState({ visibility: visibility, visibilityOpen: false }, () => {
      this.props.getPosts({ visibility: visibility });
    });
  }

  private onSortByChange(sort: PostSortType) {
    this.setState({ sortBy: sort, sortByOpen: false }, () => {
      this.props.getPosts({ sortType: sort });
    });
  }

  private onUserChange(user: User | null) {
    this.setState({ user: user }, () => {
      this.props.getPosts({ author: user ? user.username : '' });
    });
  }

  render() {
    const posts = this.props.posts;
    const multipleSelected = this.props.selected.length > 1;

    return (
      <div style={{ position: 'relative' }}>
        {posts ? (
          <Pager
            loading={this.props.loading}
            total={posts!.count}
            limit={posts!.limit}
            index={posts!.index}
            onPage={(index) => {
              if (this._container.current) this._container.current.scrollTop = 0;
              this.props.getPosts({ index: index });
            }}
            contentProps={{
              onMouseDown: (e) => this.props.onPostSelected([]),
            }}
          >
            <Filter
              animated={this.props.animated}
              className={`mt-filters-panel ${this.props.filtersOpen ? 'open' : 'closed'}`}
              filtersOpen={this.props.filtersOpen}
            >
              <div>
                <h3>Sort Order:</h3>
                <div
                  ref={(e) => (this._sortElm = e)}
                  onClick={(e) => this.setState({ sortByOpen: true })}
                  className="mt-filter-sortby"
                >
                  {this.state.sortBy}
                </div>
                <Menu
                  anchorEl={this._sortElm || undefined}
                  open={this.state.sortByOpen}
                  transitionDuration={this.props.animated ? 'auto' : 0}
                  onClose={(e) => this.setState({ sortByOpen: false })}
                >
                  <MenuItem className="mt-filter-sortby-title" onClick={(e) => this.onSortByChange('title')}>
                    Title
                  </MenuItem>
                  <MenuItem className="mt-filter-sortby-created" onClick={(e) => this.onSortByChange('created')}>
                    Created
                  </MenuItem>
                  <MenuItem className="mt-filter-sortby-modified" onClick={(e) => this.onSortByChange('modified')}>
                    Modified
                  </MenuItem>
                </Menu>
                <IconButton
                  style={{
                    cursor: 'pointer',
                    margin: '0 0 0 5px',
                    verticalAlign: 'middle',
                    height: '20px',
                    width: '20px',
                  }}
                  className="mt-sort-order"
                  ref={(e) => (this._sortElm = e)}
                  onClick={(e) => this.onAscChange()}
                >
                  {this.state.sortAscending ? (
                    <ArrowDownIcon style={{ padding: 0, height: '20px', width: '20px' }} />
                  ) : (
                    <ArrowUpIcon style={{ padding: 0, height: '20px', width: '20px' }} />
                  )}
                </IconButton>
              </div>
              <div>
                <h3>Filter Visibility:</h3>
                <div
                  ref={(e) => (this._visibilityElm = e)}
                  onClick={(e) => this.setState({ visibilityOpen: true })}
                  className="mt-filter-visibility"
                >
                  {this.state.visibility}
                </div>
                <Menu
                  onClose={() => this.setState({ visibilityOpen: false })}
                  transitionDuration={this.props.animated ? 'auto' : 0}
                  open={this.state.visibilityOpen}
                  anchorEl={this._visibilityElm!}
                >
                  <MenuItem className="mt-filter-visibility-all" onClick={(e) => this.onVisibilityChange('all')}>
                    All
                  </MenuItem>
                  <MenuItem
                    className="mt-filter-visibility-private"
                    onClick={(e) => this.onVisibilityChange('private')}
                  >
                    Private
                  </MenuItem>
                  <MenuItem className="mt-filter-visibility-public" onClick={(e) => this.onVisibilityChange('public')}>
                    Public
                  </MenuItem>
                </Menu>
              </div>
              <div>
                <h3>Filter User:</h3>
                <UserPicker
                  user={this.state.user}
                  imageSize={26}
                  labelPosition="right"
                  onChange={(user) => this.onUserChange(user)}
                />
              </div>
            </Filter>

            <PostsInnerContent
              filtersOpen={this.props.filtersOpen}
              animated={this.props.animated}
              className="mt-posts"
              ref={this._container}
            >
              {posts.data.map((post, postIndex) => {
                const selected = this.props.selected.indexOf(post) === -1 ? false : true;

                return (
                  <PostDiv
                    key={'post-' + postIndex}
                    selected={selected}
                    style={!this.props.animated ? { transition: 'none' } : undefined}
                    className={`mt-post ${selected ? 'selected' : ''}`}
                    onMouseDown={(e) => {
                      this.onPostSelected(post, e);
                    }}
                  >
                    {!multipleSelected ? (
                      <IconButton
                        style={{ top: -5, right: '60px', position: 'absolute' }}
                        className="mt-post-button mt-post-edit"
                        onClick={(e) => this.props.onEdit(post)}
                      >
                        <EditIcon style={{ color: theme.primary200.background }} />
                      </IconButton>
                    ) : undefined}
                    {!multipleSelected ? (
                      <IconButton
                        style={{ top: -5, right: 6, position: 'absolute' }}
                        className="mt-post-button mt-post-delete"
                        onClick={(e) => this.props.onDelete(post)}
                      >
                        <DeleteIcon style={{ color: theme.primary200.background }} />
                      </IconButton>
                    ) : undefined}
                    <div className="mt-post-featured-thumb">
                      {post.featuredImage ? (
                        <img src={post.featuredImage.publicURL} />
                      ) : (
                        <img src={'/images/post-feature.svg'} />
                      )}
                    </div>
                    <div className="mt-post-dates">
                      <div>
                        <div>
                          <i>Last Updated:</i>
                        </div>
                        <div>
                          <i className="mt-post-last-updated">{format(new Date(post.lastUpdated), 'MMM do, yyyy')}</i>
                        </div>
                      </div>
                      <div>
                        <div>
                          <i>Created:</i>
                        </div>
                        <div>
                          <i className="mt-post-created">{format(new Date(post.createdOn), 'MMM do, yyyy')}</i>
                        </div>
                      </div>
                    </div>
                    <div className="mt-post-info">
                      <Avatar
                        src={generateAvatarPic(post.author || null)}
                        style={{ width: 36, height: 36, float: 'right', margin: '10px 0 0 0' }}
                      />
                      <h3 className="mt-post-name">{post.title || 'UNTITLED'}</h3>
                    </div>
                  </PostDiv>
                );
              })}
            </PostsInnerContent>
          </Pager>
        ) : undefined}
      </div>
    );
  }
}

interface PostProps extends React.HTMLProps<HTMLDivElement> {}

interface FilterProps extends React.HTMLProps<HTMLDivElement> {
  filtersOpen: boolean;
  animated: boolean;
}

const filterSize = 80;

const PostsInnerContent = styled.div`
  height: ${(props: FilterProps) => (props.filtersOpen ? `calc( 100% - ${filterSize}px )` : '100%')};
  transition: ${(props: FilterProps) => (props.animated ? '1' : '0')}s height;
  overflow: auto;
`;

const Filter = styled.div`
  background: ${theme.light100.background};
  color: ${theme.light100.color};
  overflow: hidden;
  transition: ${(props: FilterProps) => (props.animated ? '1' : '0')}s height;
  height: ${(props: FilterProps) => (props.filtersOpen ? `${filterSize}px` : '0')};
  box-sizing: border-box;
  display: flex;

  > div {
    padding: 5px 10px;
    flex: 1;
    border-bottom: 1px solid ${theme.light100.border};
    overflow: hidden;
  }

  .mt-filter-visibility,
  .mt-filter-sortby {
    text-transform: capitalize;
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    border-bottom: 1px solid transparent;
    line-height: 26px;

    &:hover {
      border-bottom: 1px solid ${theme.light100.border};
    }
  }
`;

const PostDiv = styled.div`
  margin: 10px;
  float: left;
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.25s background;
  width: 300px;
  height: 300px;
  background: ${(props: PostProps) => (props.selected ? theme.primary200.background : theme.light300.background)};
  color: ${(props: PostProps) => (props.selected ? theme.primary200.color : '')};
  user-select: none;
  position: relative;

  &:hover {
    background: ${(props: PostProps) => (props.selected ? '' : theme.light400.background)};
    color: ${(props: PostProps) => (props.selected ? '' : theme.light400.color)};

    .mt-post-button {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mt-post-info {
    clear: both;
    padding: 0 5px;

    > h3 {
      display: inline-block;
      width: 70%;
    }
  }

  .mt-post-dates {
    padding: 5px 5px 0 5px;
    border-top: 1px solid #ccc;
    display: flex;

    > div {
      flex: 1;
      font-size: 12px;

      > div:first-child {
        opacity: 0.7;
        margin: 0 0 2px 0;
        font-size: 10px;
      }

      &:last-child {
        text-align: right;
      }
    }
  }

  &:active {
    background: ${(props: PostProps) => (props.selected ? '' : theme.light100.background)};
    color: ${(props: PostProps) => (props.selected ? '' : theme.light100.color)};
  }

  .mt-post-button {
    opacity: 0;
    top: 0;
    transition: opacity 0.3s, transform 0.3s;
    transform: translateY(-15px);
    background: ${theme.light100.background};

    &:hover {
      background: ${theme.light200.background} !important;
      transform: translateY(0px);
    }
  }

  .mt-post-featured-thumb {
    height: 200px;
    background: ${(props: PostProps) => (props.selected ? theme.light100.background : theme.light100.background)};
    color: ${(props: PostProps) => (props.selected ? theme.light100.color : '')};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    box-sizing: border-box;
  }

  .mt-post-featured-thumb img {
    max-width: 100%;
    max-height: 100%;
  }

  h3 {
    padding: 0;
  }
`;
