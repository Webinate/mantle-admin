import * as React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import FontCancel from '@material-ui/icons/ArrowBack';

export type Props = {
  mode: 'new-volume' | 'volumes';
  onNewVolume: () => void;
  onBack: () => void;
}

export type State = {
  searchFilter: string;
}

export class MediaFilterBar extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      searchFilter: ''
    };
  }

  private onSearch() {

  }

  render() {
    const buttonIconStyle: React.CSSProperties = { margin: '0 5px 0 0' };
    const mode = this.props.mode;

    return (
      mode === 'volumes' ?
        <div>
          <TextField
            placeholder="Filter by name"
            id="mt-media-filter"
            value={this.state.searchFilter}
            onKeyDown={e => {
              if ( e.keyCode === 13 )
                this.onSearch();
            }}
            onChange={( e ) => this.setState( {
              searchFilter: e.currentTarget.value
            } )}
          />
          <IconButton
            id="mt-media-search"
            color="primary"
            onClick={e => this.onSearch()}
          >
            <SearchIcon />
          </IconButton>
          <Button
            variant="contained"
            onClick={e => this.props.onNewVolume()}
            id="mt-new-volume"
            color="primary"
          >
            <AddIcon style={buttonIconStyle} />
            New Volume
        </Button>
        </div> :
        <div>
          <Button
            style={{ margin: '5px 0 0 0' }}
            onClick={e => this.props.onBack()}
            id="mt-cancel-volume"
          >
            <FontCancel style={buttonIconStyle} />
            Back
        </Button>
        </div>
    );
  }
}