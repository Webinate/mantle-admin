import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import Pager from '../../components/pager';
import { Page, IPost, IUserEntry } from 'modepress';
import * as moment from 'moment';
import { default as styled } from '../../theme/styled';
import { generateAvatarPic } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Create';
import { GetAllOptions } from '../../../../../src/lib-frontend/posts';
import UserPicker from '../user-picker';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown';

export type Props = {
  animated: boolean;
  loading: boolean;
  posts: Page<IPost<'client'>> | null;
  getPosts: ( options: Partial<GetAllOptions> ) => void;
  onPostSelected: ( post: IPost<'client'>[] ) => void
  onEdit: ( post: IPost<'client'> ) => void;
  onDelete: ( post: IPost<'client'> ) => void;
  selected: IPost<'client'>[];
  filtersOpen: boolean;
}

type VisibilityType = 'all' | 'public' | 'private';
type SortType = 'title' | 'created' | 'modified';

export type State = {
  showDeleteModal: boolean;
  sortAscending: boolean;
  user: IUserEntry<'client'> | null;
  visibility: VisibilityType;
  sortBy: SortType;
  visibilityOpen: boolean;
  sortByOpen: boolean;
}

export default class PostList extends React.Component<Props, State> {
  private _container: HTMLElement | null;

  constructor( props: Props ) {
    super( props );
    this.state = {
      showDeleteModal: false,
      sortAscending: false,
      visibility: 'all',
      sortBy: 'created',
      user: null,
      visibilityOpen: false,
      sortByOpen: false
    };
  }

  componentDidMount() {
    this.props.getPosts( {
      index: 0,
      sortOrder: this.state.sortAscending ? 'asc' : 'desc',
      visibility: this.state.visibility,
      author: '',
      sort: this.state.sortBy
    } );
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.posts !== this.props.posts )
      this.props.onPostSelected( [] );
  }

  private onPostSelected( post: IPost<'client'>, e: React.MouseEvent<HTMLDivElement> ) {
    e.preventDefault();
    e.stopPropagation();

    if ( !e.ctrlKey && !e.shiftKey ) {
      this.props.onPostSelected( [ post ] );

    }
    else if ( e.ctrlKey ) {
      if ( this.props.selected.indexOf( post ) === -1 )
        this.props.onPostSelected( this.props.selected.concat( post ) );
      else
        this.props.onPostSelected( this.props.selected.filter( i => i !== post ) );
    }
    else {
      const postPage = this.props.posts!;
      const selected = this.props.selected;

      let firstIndex = Math.min( postPage.data.indexOf( post ), selected.length > 0 ? postPage.data.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( postPage.data.indexOf( post ), selected.length > 0 ? postPage.data.indexOf( selected[ 0 ] ) : 0 );

      this.props.onPostSelected( postPage.data.slice( firstIndex, lastIndex + 1 ) );
    }
  }

  private onAscChange() {
    const val = !this.state.sortAscending;
    this.setState( { sortAscending: val }, () => {
      this.props.getPosts( { sortOrder: val ? 'asc' : 'desc' } );
    } )
  }

  private onVisibilityChange( visibility: VisibilityType ) {
    this.setState( { visibility: visibility }, () => {
      this.props.getPosts( { visibility: visibility } );
    } )
  }

  private onSortByChange( sort: SortType ) {
    this.setState( { sortBy: sort }, () => {
      this.props.getPosts( { sort: sort } );
    } )
  }

  private onUserChange( user: IUserEntry<'client'> | null ) {
    this.setState( { user: user }, () => {
      this.props.getPosts( { author: user ? user.username : '' } );
    } )
  }

  render() {
    const posts = this.props.posts;
    const multipleSelected = this.props.selected.length > 1;

    return <div style={{ position: 'relative' }}>
      {posts ? <Pager
        loading={this.props.loading}
        total={posts!.count}
        limit={posts!.limit}
        index={posts!.index}
        onPage={index => {
          if ( this._container )
            this._container.scrollTop = 0;
          this.props.getPosts( { index: index } )
        }}
        contentProps={{
          onMouseDown: e => this.props.onPostSelected( [] )
        }}
      >
        <Filter
          animated={this.props.animated}
          className={`mt-filters-panel ${ this.props.filtersOpen ? 'open' : 'closed' }`} filtersOpen={this.props.filtersOpen}>
          <div>
            <h3>Sort Order:</h3>
            <IconButton
              style={{ cursor: 'pointer', verticalAlign: 'middle' }}
              className="mt-filter-sortby-drop"
              onClick={( e ) => this.setState( { sortByOpen: true } )}
            >
              <ArrowDownIcon style={{ padding: 0, height: '20px', width: '20px' }} />
            </IconButton>
            <Menu
              open={this.state.sortByOpen}
              transitionDuration={this.props.animated ? 'auto' : 0}
              onClose={( e ) => this.setState( { sortByOpen: false } )}
            >
              <MenuItem
                className="mt-filter-sortby-title"
                onClick={e => this.onSortByChange( 'title' )}
              >Title</MenuItem>
              <MenuItem
                className="mt-filter-sortby-created"
                onClick={e => this.onSortByChange( 'created' )}
              >Created</MenuItem>
              <MenuItem
                className="mt-filter-sortby-modified"
                onClick={e => this.onSortByChange( 'modified' )}
              >Modified</MenuItem>
            </Menu>
            <div
              onClick={e => this.setState( { sortByOpen: true } )}
              className="mt-filter-sortby">
              {this.state.sortBy}
            </div>

            <FormControlLabel
              control={
                <Switch
                  className="mt-sort-order"
                  style={{ margin: '10px 0 0 0' }}
                  checked={this.state.sortAscending}
                  onChange={e => this.onAscChange()}
                  value="gilad"
                />
              }
              label={this.state.sortAscending ? 'Sort ascending' : 'Sort descending'}
            />

          </div>
          <div>
            <h3>Filter Visibility:</h3>
            <IconButton
              className="mt-filter-visibility-drop"
              style={{ cursor: 'pointer', verticalAlign: 'middle' }}
              onClick={e => this.setState( { visibilityOpen: true } )}
            >
              <ArrowDownIcon style={{ padding: 0, height: '20px', width: '20px' }} />
            </IconButton>
            <Menu
              onClose={() => this.setState( { visibilityOpen: false } )}
              transitionDuration={this.props.animated ? 'auto' : 0}
              open={this.state.visibilityOpen}
            >
              <MenuItem
                className="mt-filter-visibility-all"
                onClick={e => this.onVisibilityChange( 'all' )}
              >All</MenuItem>
              <MenuItem
                className="mt-filter-visibility-private"
                onClick={e => this.onVisibilityChange( 'private' )}
              >Private</MenuItem>
              <MenuItem
                className="mt-filter-visibility-public"
                onClick={e => this.onVisibilityChange( 'public' )}
              >Public</MenuItem>

            </Menu>
            <div
              onClick={e => this.setState( { visibilityOpen: true } )}
              className="mt-filter-visibility">{this.state.visibility}</div>
          </div>
          <div>
            <h3>Filter User:</h3>
            <UserPicker
              user={this.state.user}
              imageSize={26}
              labelPosition="right"
              onChange={user => this.onUserChange( user )}
            />
          </div>
        </Filter>

        <PostsInnerContent
          filtersOpen={this.props.filtersOpen}
          animated={this.props.animated}
          className="mt-posts"
          innerRef={elm => this._container = elm}
        >
          {posts.data.map( ( post, postIndex ) => {
            const selected = this.props.selected.indexOf( post ) === -1 ? false : true;
            return <Post
              key={'post-' + postIndex}
              selected={selected}
              style={!this.props.animated ? { transition: 'none' } : undefined}
              className={`mt-post ${ selected ? 'selected' : '' }`}
              onMouseDown={e => { this.onPostSelected( post, e ) }}
            >
              {!multipleSelected ? <IconButton
                style={{ top: 0, right: '30px', position: 'absolute' }}
                className="mt-post-button mt-post-edit"
                onClick={e => this.props.onEdit( post )}
              ><EditIcon style={{ color: theme.primary200.background }} /></IconButton> : undefined
              }
              {!multipleSelected ?
                <IconButton
                  style={{ top: 0, right: 0, position: 'absolute' }}
                  className="mt-post-button mt-post-delete"
                  onClick={e => this.props.onDelete( post )}
                ><DeleteIcon style={{ color: theme.primary200.background }} /></IconButton> : undefined
              }
              <div className="mt-post-featured-thumb">{post.featuredImage ? <img src={post.featuredImage} /> : <img src={'/images/post-feature.svg'} />}</div>
              <div className="mt-post-dates">
                <i>{moment( post.lastUpdated ).format( 'MMM Do, YYYY' )}</i>
                <i>{moment( post.createdOn ).format( 'MMM Do, YYYY' )}</i>
              </div>
              <div className="mt-post-info">
                <Avatar
                  src={generateAvatarPic( post.author ? ( post.author as IUserEntry<'client'> ).avatar : '' )}
                  style={{ width: 60, height: 60, float: 'right', margin: '5px 0 0 0' }}
                />
                <h3 className="mt-post-name">{post.title || 'UNTITLED'}</h3>
              </div>
            </Post>
          } )}
        </PostsInnerContent>
      </Pager> : undefined}
    </div>
  }
}

interface PostProps extends React.HTMLProps<HTMLDivElement> {
}

interface FilterProps extends React.HTMLProps<HTMLDivElement> {
  filtersOpen: boolean;
  animated: boolean;
}

const filterSize = 120;

const PostsInnerContent = styled.div`
  height: ${ ( props: FilterProps ) => props.filtersOpen ? `calc( 100% - ${ filterSize }px )` : '100%' };
  transition: 1s height;
  overflow: auto;
`;

const Filter = styled.div`
  background: ${ theme.light100.background };
  color: ${ theme.light100.color };
  overflow: hidden;
  transition: ${ ( props: FilterProps ) => props.animated ? '1' : '0' }s height;
  height: ${ ( props: FilterProps ) => props.filtersOpen ? `${ filterSize }px` : '0' };
  box-sizing: border-box;
  display: flex;

  > div {
    padding: 5px 10px;
    flex: 1;
    border-bottom: 1px solid ${theme.light100.border };
  }

  .mt-filter-visibility, .mt-filter-sortby {
    text-transform: capitalize;
    margin: 0 0 0 5px;
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
  }
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
      width: 70%;
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

  .mt-post-featured-thumb {
    height: 200px;
    background: ${( props: PostProps ) => props.selected ? theme.light100.background : theme.light100.background };
    color: ${( props: PostProps ) => props.selected ? theme.light100.color : '' };
    text-align: center;
  }

  .mt-post-featured-thumb img {
    height: 100%;
  }

  h3 {
    padding: 5px 0 0 0;
    clear: both;
  }
`;