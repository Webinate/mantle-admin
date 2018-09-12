import * as React from 'react';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import UploadIcon from '@material-ui/icons/FileUpload';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { IFileEntry } from '../../../../../src';
import { formatBytes } from '../../utils/component-utils';

export type Props = {
  selectedFile: IFileEntry<'client'> | null;
  selectedIds: string[];
  onDelete: () => void;
  onRename: () => void;
  onUploadFiles?: ( files: File[] ) => void;
  renderOptionalButtons?: () => undefined | null | JSX.Element;
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
    if ( e.currentTarget.files && this.props.onUploadFiles )
      this.props.onUploadFiles( Array.from( e.currentTarget.files ) );

    e.currentTarget.value = '';
  }

  private getPreview( file: IFileEntry<'client'> ) {
    if ( file.mimeType === 'image/png' || file.mimeType === 'image/jpeg' || file.mimeType === 'image/jpg' || file.mimeType === 'image/gif' )
      return file.publicURL;
    else
      return '/images/harddrive.svg';
  }

  render() {
    const filesSelected = this.props.selectedIds.length > 0 ? true : false;
    const selectedFile = this.props.selectedFile;

    return (
      <Container id="mt-file-details">
        {selectedFile ? <h2>{selectedFile.name}</h2> : undefined}
        <input
          ref={e => this._fileInput = e}
          multiple={true}
          style={{ visibility: 'hidden', height: '0px', width: '4px' }}
          id="mt-file-upload-input"
          type="file"
          onChange={e => this.onFilesChanged( e )}
        />
        {selectedFile ? <Preview>
          <img src={this.getPreview( selectedFile )} />
        </Preview> : null}
        {selectedFile ? <Info>
          <div>
            <div>Size</div>
            <div id="mt-file-size">{formatBytes( selectedFile.size )}</div>
          </div>

          <div>
            <div>URL</div>
            <div id="mt-file-url">
              <input
                value={selectedFile.publicURL}
                onChange={e => { }}
                onClick={e => e.currentTarget.setSelectionRange( 0, e.currentTarget.value.length )}
              />
            </div>
          </div>

          <div>
            <div>Type</div>
            <div id="mt-file-type">{selectedFile.mimeType}</div>
          </div>
        </Info> : null}
        <List
          component="nav"
        >
          <ListItem
            button
            onClick={e => this.onUpload()}
            id="mt-upload-file"
          >
            <ListItemIcon>
              <UploadIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Upload files"
            />
          </ListItem>

          <ListItem
            button
            disabled={!filesSelected}
            onClick={e => this.props.onDelete()}
            id="mt-delete-file"
          >
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Delete files"
            />
          </ListItem>

          <ListItem
            button
            disabled={!filesSelected}
            onClick={e => this.props.onRename()}
            id="mt-rename-file"
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Rename"
            />
          </ListItem>
        </List>

        {this.props.renderOptionalButtons ? this.props.renderOptionalButtons() : undefined}
      </Container>
    );
  }
}

const Container = styled.div`
  background: ${theme.light100.background };
  height: 100%;
  box-sizing: border-box;
  overflow: auto;

  > h2 {
    margin: 0 24px 10px 24px;
    white-space: initial;
    overflow: hidden;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }

  > div:first-child {
    padding: 10px 24px 0 24px;
  }
`;

const Info = styled.div`
  display: table;
  width: 100%;
  table-layout: fixed;
  padding: 0px 24px;
  box-sizing: border-box;
  margin: 10px 0 0 0;

  input {
    width: 100%;
    box-sizing: border-box;
    border: none;
    outline: none;
  }

  > div > div:first-child {
    width: 60px;
    font-style: italic;
    font-weight: 400;
  }

  > div {
    display: table-row;
  }

  > div > div {
    display: table-cell;
    padding: 5px;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const Preview = styled.div`
  overflow: hidden;
  width: 100%;
  padding: 0 24px;

  img {
    max-width: 100%;
    max-height: 270px;
  }
`;