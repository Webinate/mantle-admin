import * as React from 'react';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { default as styled } from '../theme/styled';
import ContentHeader from '../components/content-header';
import { getComments, editComment, deleteComment, createComment } from '../store/comments/actions';
import FilterBar from '../components/comments/filter-bar';
import { IUserEntry, IPost } from 'modepress';
import { isAdminUser } from '../utils/component-utils';
import { CommentsList } from '../components/comments/comments-list';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ArrowDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowUpIcon from '@material-ui/icons/ArrowDropUp';
import IconButton from '@material-ui/core/IconButton';
import theme from '../theme/mui-theme';
import UserPicker from '../components/user-picker';
import PostPreview from '../components/posts/post-preview';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  user: state.authentication.user,
  commentState: state.comments,
  app: state.app,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getAll: getComments,
  editComment,
  deleteComment,
  createComment
}

type SortType = 'created' | 'updated';

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  sortBy: SortType;
  showDeleteModal: boolean;
  filtersOpen: boolean;
  sortByOpen: boolean;
  sortAscending: boolean;
  selectedUid: string | null;
  selectedPostUid: string | null;
  user: IUserEntry<'client' | 'expanded'> | null;
};

/**
 * The comments container
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Comments extends React.Component<Props, State> {
  private _sortElm: HTMLElement | null;

  constructor( props: Props ) {
    super( props );
    this._sortElm = null;

    const filters = props.commentState.commentFilters;

    this.state = {
      showDeleteModal: false,
      filtersOpen: false,
      sortByOpen: false,
      sortAscending: filters.sortOrder! === 'asc' ? true : false,
      sortBy: filters.sortType ? filters.sortType : 'updated',
      user: null,
      selectedUid: null,
      selectedPostUid: null
    };
  }

  private onSearch( term: string ) {
    this.props.getAll( { index: 0, keyword: term } );
  }

  private onSortByChange( sort: SortType ) {
    this.setState( { sortBy: sort, sortByOpen: false }, () => {
      this.props.getAll( { sortType: sort } );
    } )
  }

  private onAscChange() {
    const val = !this.state.sortAscending;
    this.setState( { sortAscending: val, sortByOpen: false }, () => {
      this.props.getAll( {
        sortOrder: val ? 'asc' : 'desc'
      } );
    } )
  }

  private onUserChange( user: IUserEntry<'client' | 'expanded'> | null ) {
    this.setState( { user: user }, () => {
      this.props.getAll( { user: user ? user.username : '' } );
    } )
  }

  render() {
    const page = this.props.commentState.commentPage;
    const isBusy = this.props.commentState.busy;
    const isAdmin = isAdminUser( this.props.user );
    const animated = this.props.app.debugMode ? false : true;
    let selectedPost: IPost<'client'> | null = null;

    if ( page && this.state.selectedUid ) {
      const comment = page.data.find( c => ( c.post as IPost<'client'> )._id === this.state.selectedPostUid )!;
      if ( comment )
        selectedPost = comment.post as IPost<'client'>;
    }

    return (
      <div className="mt-comments-container">
        <ContentHeader
          title="Comments"
          busy={isBusy}
          renderFilters={() => <FilterBar
            onSearch={term => this.onSearch( term )}
            commentsSelected={false}
            isAdminUser={isAdmin ? false : true}
            onFilterToggle={val => this.setState( { filtersOpen: val } )}
            filtersOpen={this.state.filtersOpen}
          />}
        >
        </ContentHeader>
        <Container>
          <Filter
            animated={animated}
            className={`mt-filters-panel ${ this.state.filtersOpen ? 'open' : 'closed' }`}
            filtersOpen={this.state.filtersOpen}
          >
            <div>
              <h3>Sort Order:</h3>
              <div
                ref={e => this._sortElm = e}
                onClick={e => this.setState( { sortByOpen: true } )}
                className="mt-filter-sortby">
                {this.state.sortBy}
              </div>
              <Menu
                anchorEl={this._sortElm || undefined}
                open={this.state.sortByOpen}
                transitionDuration={animated ? 'auto' : 0}
                onClose={( e ) => this.setState( { sortByOpen: false } )}
              >
                <MenuItem
                  className="mt-filter-sortby-created"
                  onClick={e => this.onSortByChange( 'created' )}
                >Created</MenuItem>
                <MenuItem
                  className="mt-filter-sortby-updated"
                  onClick={e => this.onSortByChange( 'updated' )}
                >Updated</MenuItem>
              </Menu>
              <IconButton
                style={{ cursor: 'pointer', margin: '0 0 0 5px', verticalAlign: 'middle', height: '20px', width: '20px' }}
                className="mt-sort-order"
                buttonRef={( e ) => this._sortElm = e}
                onClick={( e ) => this.onAscChange()}
              >
                {
                  this.state.sortAscending ?
                    <ArrowDownIcon style={{ padding: 0, height: '20px', width: '20px' }} /> :
                    <ArrowUpIcon style={{ padding: 0, height: '20px', width: '20px' }} />
                }

              </IconButton>
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
          <div
            style={{ height: this.state.filtersOpen ? `calc(100% - ${ filterSize }px)` : '100%' }}
          >
            <div className="mt-comment-list-container">
              <div>
                <CommentsList
                  auth={this.props.user!}
                  style={{ padding: '20px' }}
                  heightFromContents={false}
                  selectedUids={this.state.selectedUid ? [ this.state.selectedUid ] : undefined}
                  onCommentSelected={comment => {
                    if ( comment ) {
                      this.setState( {
                        selectedUid: comment._id,
                        selectedPostUid: typeof ( comment.post ) === 'string' ? comment.post : comment.post._id
                      } );
                    }
                    else {
                      this.setState( {
                        selectedUid: null,
                        selectedPostUid: null
                      } );
                    }
                  }}
                  getAll={options => this.props.getAll( options )}
                  onEdit={( id, token ) => this.props.editComment( id, token )}
                  onReply={( post, parent, comment ) => this.props.createComment( post, comment, parent )}
                  onDelete={id => this.props.deleteComment( id )}
                  loading={isBusy}
                  page={page}
                />
              </div>
              {selectedPost ? <div>
                <PostPreview
                  post={selectedPost}
                  loading={false}
                />
              </div> : undefined}
            </div>

          </div>
        </Container>
      </div >
    );
  }
}

interface FilterProps extends React.HTMLProps<HTMLDivElement> {
  filtersOpen: boolean;
  animated: boolean;
}

const filterSize = 80;

const Container = styled.div`
  overflow: auto;
  height: calc(100% - 50px);
  box-sizing: border-box;

  .mt-comment-list-container {
    display: flex;
    > div {
      flex: 1;
    }
  }
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
    overflow: hidden;
  }

  .mt-filter-sortby {
    text-transform: capitalize;
    display: inline-block;
    vertical-align: middle;
    cursor: pointer;
    border-bottom: 1px solid transparent;
    line-height: 26px;

    &:hover {
      border-bottom: 1px solid ${theme.light100.border };
    }
  }
`;