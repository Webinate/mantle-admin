import * as React from 'react';
import { useState, useEffect } from 'react';
import { User } from 'mantle';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { create, getUsers, removeUser, update } from '../store/users/actions';
import { State as UsersState } from '../store/users/reducer';
import { State as AuthState } from '../store/authentication/reducer';
import { State as AppState } from '../store/app/reducer';
import adminActions from '../store/admin-actions/actions';
import UsersList from '../components/users/users-list';
import ContentHeader from '../components/content-header';
import Pager from '../components/pager';
import UserProperties from '../components/users/users-properties';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import { default as styled } from '../theme/styled';
import NewUserForm from '../components/users/new-user-form';
import FontCancel from '@material-ui/icons/ArrowBack';
import { useSelector, useDispatch } from 'react-redux';

/**
 * The main application entry point
 */
const Users: React.FC<void> = (props) => {
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState('');
  const [dialogue, setDialogue] = useState<null | string>(null);
  const [dialogueHeader, setDialogueHeader] = useState('');
  const [dialogueConfirmBtn, setDialogueConfirmBtn] = useState('Ok');
  const [newUserForm, setNewUserForm] = useState(false);
  const dispatch = useDispatch();
  const userState = useSelector<IRootState, UsersState>((state) => state.users);
  const auth = useSelector<IRootState, AuthState>((state) => state.authentication);
  const app = useSelector<IRootState, AppState>((state) => state.app);

  useEffect(() => {
    if (app.appHasHistory) dispatch(getUsers());
  }, [dispatch, app]);

  const onUserSelected = (user: User, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.ctrlKey && !e.shiftKey) {
      setSelectedUids([user._id as string]);
    } else if (e.ctrlKey) {
      if (selectedUids.indexOf(user._id as string) === -1) setSelectedUids(selectedUids.concat(user._id as string));
      else setSelectedUids(selectedUids.filter((i) => i !== user._id));
    } else {
      const userPage = userState.userPage!;
      const selected = selectedUids;

      let firstIndex = Math.min(
        userPage.data.indexOf(user),
        selected.length > 0 ? userPage.data.findIndex((u) => u._id === selected[0]) : 0
      );
      let lastIndex = Math.max(
        userPage.data.indexOf(user),
        selected.length > 0 ? userPage.data.findIndex((u) => u._id === selected[0]) : 0
      );

      setSelectedUids(userPage.data.slice(firstIndex, lastIndex + 1).map((u) => u._id as string));
    }
  };

  const renderModal = (onConfirm: () => void) => {
    return (
      <Dialog className="mt-users-modal" open={true}>
        <DialogTitle>{dialogueHeader}</DialogTitle>
        <DialogContent>
          <DialogContentText className="mt-modal-message">{dialogue}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="mt-cancel" variant="contained" onClick={(e) => setDialogue(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="mt-confirm"
            style={{ background: theme.error.background, color: theme.error.color }}
            onClick={(e) => {
              setDialogue(null);
              onConfirm();
            }}
          >
            {dialogueConfirmBtn}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderUserList = (selected: User | null) => {
    const animated = app.debugMode ? false : true;
    const page = typeof userState.userPage! === 'string' ? null : userState.userPage!;
    const isBusy = userState.busy;

    return (
      <SplitPanel animated={animated}>
        <div>
          {page ? (
            <Pager
              limit={page.limit}
              loading={isBusy}
              onPage={(index) => dispatch(getUsers(index))}
              index={page.index}
              total={page.count}
              contentProps={{ onMouseDown: (e) => setSelectedUids([]) }}
            >
              <UsersList
                users={page.data}
                selected={selectedUids}
                onUserSelected={(user, e) => onUserSelected(user, e)}
              />
            </Pager>
          ) : undefined}
        </div>
        {selected ? (
          <div
            className="mt-selected"
            ref={
              animated
                ? (e) => {
                    if (e) setTimeout(() => (e.style.maxWidth = '400px'), 30);
                  }
                : undefined
            }
          >
            <UserProperties
              animated={animated}
              resetPasswordRequest={(username) => {
                dispatch(adminActions.requestPasswordReset(username));
              }}
              activateAccount={(username) => {
                dispatch(adminActions.activate(username));
              }}
              resendActivation={(username) => {
                dispatch(adminActions.resendActivation(username));
              }}
              updateUserAvatar={(userId, file) => dispatch(update({ _id: userId, avatarFile: file._id }))}
              activeUser={auth.user!}
              updateUserDetails={(user) => dispatch(update({ ...user, _id: user._id! as string }))}
              onDeleteRequested={(user) => {
                setDialogue(
                  `Are you sure you want to remove the user '${user.username}', this action is irreversible?`
                );
                setDialogueHeader('Remove User');
                setDialogueConfirmBtn(`I Understand, Remove User`);
              }}
              selected={selected}
            />
          </div>
        ) : undefined}
      </SplitPanel>
    );
  };

  const renderListHeader = () => {
    const isAdmin = auth.user && auth.user.privileges !== 'regular' ? true : false;
    const isBusy = userState.busy;

    return (
      <div>
        <TextField
          className="users-filter"
          style={{ verticalAlign: 'middle' }}
          placeholder="Filter username or email"
          id="mt-users-filter"
          value={userFilter}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              setSelectedUids([]);
              getUsers(0, userFilter);
            }
          }}
          onChange={(e) => setUserFilter(e.currentTarget.value)}
        />
        <IconButton
          id="mt-users-search-button"
          onClick={(e) => {
            setSelectedUids([]);
            dispatch(getUsers(0, userFilter));
          }}
          style={{ verticalAlign: 'middle' }}
        >
          <SearchIcon style={{ color: theme.primary200.background }} />
        </IconButton>
        {isAdmin ? (
          <Button
            variant="contained"
            onClick={(e) => setNewUserForm(true)}
            id="mt-add-user"
            disabled={isBusy}
            color="primary"
          >
            <AddIcon />
            Add User
          </Button>
        ) : undefined}
      </div>
    );
  };

  const renderFormHeader = () => {
    return (
      <div>
        <Button style={{ margin: '5px 0 0 0' }} onClick={(e) => setNewUserForm(false)} id="mt-cancel-new-user">
          <FontCancel />
          Back
        </Button>
      </div>
    );
  };

  const isBusy = userState.busy;
  const selected =
    selectedUids.length > 0
      ? userState.userPage!.data.find((u) => u._id === selectedUids[selectedUids.length - 1]) || null
      : null;

  return (
    <div style={{ height: '100%' }}>
      <ContentHeader
        title="Users"
        busy={isBusy}
        renderFilters={() => (newUserForm ? renderFormHeader() : renderListHeader())}
      />

      {newUserForm ? (
        <NewUserForm
          serverError={'There was an error babe'}
          onUserCreated={(newUser) => dispatch(create(newUser, () => setNewUserForm(false)))}
          onCancel={() => setNewUserForm(false)}
        />
      ) : (
        renderUserList(selected)
      )}

      {dialogue
        ? renderModal(() => {
            dispatch(removeUser(selected!.username));
          })
        : undefined}
    </div>
  );
};

export default Users;

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  animated: boolean;
}

const SplitPanel = styled.div`
  height: calc(100% - 50px);
  box-sizing: border-box;
  display: flex;

  > div {
    flex: 1;
    &.mt-selected {
      max-width: ${(props: PanelProps) => (props.animated ? '0px' : '400px')};
      transition: ${(props: PanelProps) => (props.animated ? 'max-width 0.5s' : 'none')};
    }
  }
`;
