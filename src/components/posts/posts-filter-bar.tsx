import * as React from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FontCancel from '@material-ui/icons/ChevronLeft';
import FilterIcon from '@material-ui/icons/FilterList';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import theme from '../../theme/mui-theme';

export type Props = {
  inPostsRoot: boolean;
  filtersOpen: boolean;
  isAdminUser: boolean;
  postsSelected: boolean;
  loading: boolean;
  onCancel: () => void;
  onSearch: (term: string) => void;
  onNew: () => void;
  onDelete: () => void;
  onFilterToggle: (val: boolean) => void;
};

type State = {
  searchFilter: string;
};

export default class PostFilterBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      searchFilter: ''
    };
  }

  render() {
    const buttonIconStyle: React.CSSProperties = { margin: '0 5px 0 0' };

    if (!this.props.inPostsRoot) {
      return (
        <Button
          id="mt-to-post-list"
          style={{ margin: '5px 0 0 0', color: theme.primary200.background }}
          onClick={e => this.props.onCancel()}
        >
          <FontCancel style={buttonIconStyle} />
          Back
        </Button>
      );
    } else
      return (
        <div>
          <TextField
            placeholder="Filter by title or content"
            id="mt-posts-filter"
            value={this.state.searchFilter}
            onKeyDown={e => {
              if (e.keyCode === 13) this.props.onSearch(this.state.searchFilter);
            }}
            onChange={e => this.setState({ searchFilter: e.currentTarget.value })}
          />
          <IconButton
            className="mt-posts-search"
            color="primary"
            onClick={e => this.props.onSearch(this.state.searchFilter)}
          >
            <SearchIcon />
          </IconButton>
          <Tooltip title={this.props.filtersOpen ? 'Close filter options' : 'Open filter options'}>
            <IconButton
              color="primary"
              className="mt-posts-filter"
              onClick={e => this.props.onFilterToggle(!this.props.filtersOpen)}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete selected posts">
            <IconButton
              color="primary"
              className="mt-posts-delete-multi"
              disabled={this.props.postsSelected}
              onClick={e => this.props.onDelete()}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={e => this.props.onNew()}
            className="mt-new-post"
            disabled={this.props.isAdminUser || this.props.loading}
            color="primary"
          >
            <AddIcon style={buttonIconStyle} />
            New Post
          </Button>
        </div>
      );
  }
}
