import * as React from 'react';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';

export type Props = {
  onDelete: () => void;
}

export type State = {
}

export default class FileSidePanel extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
  }

  render() {
    return (
      <Container>
        <div>
          <Tooltip title="Upload a file">
            <Button
              color="primary"
              variant="contained">Upload
            </Button>
          </Tooltip>
        </div>
        <Divider style={{ margin: '10px auto 0 auto' }} />
        <List
          component="nav"
        >
          <ListItem button onClick={e => this.props.onDelete()}>
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