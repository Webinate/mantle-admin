import * as React from 'react';
import { useState } from 'react';
import { IRootState } from '../store';
import { default as styled } from '../theme/styled';
import ContentHeader from '../components/content-header';
import commentActions from '../store/comments/actions';
import FilterBar from '../components/comments/filter-bar';
import { User, CommentSortType } from 'mantle';
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
import { State as CommentsState } from '../store/comments/reducer';
import { State as AppState } from '../store/app/reducer';
import { useSelector, useDispatch } from 'react-redux';

/**
 * The comments container
 */
const Comments: React.FC = () => {
  let _sortElm: HTMLElement | null = null;
  const dispatch = useDispatch();
  const authUser = useSelector<IRootState, User | null>((state) => state.authentication.user);
  const commentState = useSelector<IRootState, CommentsState>((state) => state.comments);
  const app = useSelector<IRootState, AppState>((state) => state.app);
  const filters = commentState.commentFilters;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortByOpen, setSortByOpen] = useState(false);
  const [sortAscending, setSortAscending] = useState(filters.sortOrder! === 'asc' ? true : false);
  const [sortBy, setSortBy] = useState<CommentSortType>(filters.sortType ? filters.sortType : 'updated');
  const [user, setUser] = useState<User | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [selectedPostUid, setSelectedPostUid] = useState<string | null>(null);

  const onSearch = (term: string) => {
    dispatch(commentActions.getComments({ index: 0, keyword: term }));
  };

  const onSortByChange = (sort: CommentSortType) => {
    setSortBy(sort);
    setSortByOpen(false);
    dispatch(commentActions.getComments({ sortType: sort }));
  };

  const onAscChange = () => {
    const val = !sortAscending;
    setSortAscending(val);
    setSortByOpen(false);
    dispatch(
      commentActions.getComments({
        sortOrder: val ? 'asc' : 'desc',
      })
    );
  };

  const onUserChange = (user: User | null) => {
    setUser(user);
    dispatch(commentActions.getComments({ user: user ? user.username : '' }));
  };

  const page = commentState.commentPage;
  const isBusy = commentState.busy;
  const isAdmin = isAdminUser(authUser);
  const animated = app.debugMode ? false : true;
  let selectedPost: string | null = null;

  if (page && selectedUid) {
    const comment = page.data.find((c) => (c.postId as string) === selectedPostUid)!;
    if (comment) selectedPost = comment.postId;
  }

  return (
    <div className="mt-comments-container">
      <ContentHeader
        title="Comments"
        busy={isBusy}
        renderFilters={() => (
          <FilterBar
            onSearch={(term) => onSearch(term)}
            commentsSelected={false}
            isAdminUser={isAdmin ? false : true}
            onFilterToggle={(val) => setFiltersOpen(val)}
            filtersOpen={filtersOpen}
          />
        )}
      />
      <Container>
        <Filter
          animated={animated}
          className={`mt-filters-panel ${filtersOpen ? 'open' : 'closed'}`}
          filtersOpen={filtersOpen}
        >
          <div>
            <h3>Sort Order:</h3>
            <div ref={(e) => (_sortElm = e)} onClick={(e) => setSortByOpen(true)} className="mt-filter-sortby">
              {sortBy}
            </div>
            <Menu
              anchorEl={_sortElm || undefined}
              open={sortByOpen}
              transitionDuration={animated ? 'auto' : 0}
              onClose={(e) => setSortByOpen(false)}
            >
              <MenuItem className="mt-filter-sortby-created" onClick={(e) => onSortByChange('created')}>
                Created
              </MenuItem>
              <MenuItem className="mt-filter-sortby-updated" onClick={(e) => onSortByChange('updated')}>
                Updated
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
              ref={(e) => (_sortElm = e)}
              onClick={(e) => onAscChange()}
            >
              {sortAscending ? (
                <ArrowDownIcon style={{ padding: 0, height: '20px', width: '20px' }} />
              ) : (
                <ArrowUpIcon style={{ padding: 0, height: '20px', width: '20px' }} />
              )}
            </IconButton>
          </div>
          <div>
            <h3>Filter User:</h3>
            <UserPicker user={user} imageSize={26} labelPosition="right" onChange={(user) => onUserChange(user)} />
          </div>
        </Filter>
        <div style={{ height: filtersOpen ? `calc(100% - ${filterSize}px)` : '100%' }}>
          <div className="mt-comment-list-container">
            <div>
              <CommentsList
                auth={authUser!}
                style={{ padding: '20px' }}
                heightFromContents={false}
                selectedUids={selectedUid ? [selectedUid] : undefined}
                onCommentSelected={(comment) => {
                  if (comment) {
                    setSelectedUid(comment._id as string);
                    setSelectedPostUid(comment.postId);
                  } else {
                    setSelectedUid(null);
                    setSelectedPostUid(null);
                  }
                }}
                getAll={(options) => {
                  if (app.appHasHistory) dispatch(commentActions.getComments(options));
                }}
                onEdit={(token) => dispatch(commentActions.editComment(token))}
                onReply={(post, parent, comment) => dispatch(commentActions.createComment(comment, parent))}
                onDelete={(id) => dispatch(commentActions.deleteComment(id))}
                loading={isBusy}
                page={page}
              />
            </div>
            {selectedPost ? (
              <div>
                <PostPreview post={selectedPost} loading={false} />
              </div>
            ) : undefined}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Comments;

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
