import * as React from 'react';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import { IVolume, IUserEntry } from '../../../../../src';
import Avatar from '@material-ui/core/Avatar';
import { generateAvatarPic } from '../../utils/component-utils';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import FolderOpen from '@material-ui/icons/FolderOpen';
import AssignmentIcon from '@material-ui/icons/Assignment';

export type Props = {
  selectedVolume: IVolume<'client'> | null;
  onDelete: () => void;
  onOpen: ( volumeId: string ) => void;
  onRename: () => void;
}

export type State = {
}

export default class VolumeSidePanel extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
  }

  render() {
    const volume = this.props.selectedVolume;

    return (
      <Container id="mt-volume-info">
        {volume ? <div>
          <Tooltip title={( volume.user as IUserEntry<'client'> ).username}>
            <Avatar
              src={generateAvatarPic( ( volume.user as IUserEntry<'client'> ).avatar )}
              style={{ height: 40, width: 40 }}
            />
          </Tooltip>
        </div> : null}
        <Divider style={{ margin: '10px auto 0 auto' }} />
        <List
          component="nav"
        >
          {volume ? <ListItem button id="mt-open-volume" onClick={e => this.props.onOpen( volume._id )}>
            <ListItemIcon>
              <FolderOpen />
            </ListItemIcon>
            <ListItemText inset primary={`Open ${ volume.name }`} />
          </ListItem> : undefined}

          <ListItem button id="mt-rename-volume" disabled={!volume} onClick={e => this.props.onRename()}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary="Rename"
            />
          </ListItem>

          <ListItem button id="mt-delete-volume" onClick={e => this.props.onDelete()}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText inset primary="Delete Volumes" />
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