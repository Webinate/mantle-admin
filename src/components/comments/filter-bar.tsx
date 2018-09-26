import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FilterIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';

export type Props = {
  filtersOpen: boolean;
  isAdminUser: boolean;
  commentsSelected: boolean;
  onSearch: ( term: string ) => void;
  onFilterToggle: ( val: boolean ) => void;
}

type State = {
  searchFilter: string;
};

export default class FilterBar extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );

    this.state = {
      searchFilter: ''
    }
  }

  render() {
    return (
      <div>
        <TextField
          placeholder="Filter by title or content"
          id="mt-comments-filter"
          value={this.state.searchFilter}
          onKeyDown={e => {
            if ( e.keyCode === 13 )
              this.props.onSearch( this.state.searchFilter );
          }}
          onChange={( e ) => this.setState( { searchFilter: e.currentTarget.value } )}
        />
        <IconButton
          className="mt-comments-search"
          color="primary"
          onClick={e => this.props.onSearch( this.state.searchFilter )}
        >
          <SearchIcon />
        </IconButton>
        <Tooltip title={this.props.filtersOpen ? 'Close filter options' : 'Open filter options'}>
          <IconButton
            color="primary"
            className="mt-comments-filter"
            onClick={e => this.props.onFilterToggle( !this.props.filtersOpen )}
          >
            <FilterIcon />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
}