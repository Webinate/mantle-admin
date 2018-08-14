import * as React from 'react';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import UploadIcon from '@material-ui/icons/FileUpload';

export type Props = {
  selectedIds: string[];
  onDelete: () => void;
  onUploadFiles: ( files: File[] ) => void;
}

export type State = {
}

export default class FileSidePanel extends React.Component<Props, State> {
  private _fileInput: HTMLInputElement | null;

  constructor( props: Props ) {
    super( props );
  }

  private onUpload() {
    this._fileInput!.click();
  }

  private onFilesChanged( e: React.ChangeEvent<HTMLInputElement> ) {
    if ( e.currentTarget.files )
      this.props.onUploadFiles( Array.from( e.currentTarget.files ) );

    e.currentTarget.value = '';
  }

  render() {
    const filesSelected = this.props.selectedIds.length > 0 ? true : false;

    return (
      <Container>
        <input
          ref={e => this._fileInput = e}
          style={{ visibility: 'hidden', height: '0px' }}
          type="file"
          onChange={e => this.onFilesChanged( e )}
        />
        <List
          component="nav"
        >
          <ListItem button onClick={e => this.onUpload()}>
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Upload files"
            />
          </ListItem>

          <ListItem button disabled={!filesSelected} onClick={e => this.props.onDelete()}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Delete files"
            />
          </ListItem>
        </List>

      </Container>
    );
  }
}

const Container = styled.div`
  background: ${theme.light100.background };
  height: 100%;
  box-sizing: border-box;
  overflow: auto;

  > div:first-child {
    padding: 10px 24px 0 24px;
  }
`;