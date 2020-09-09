import * as React from 'react';
import { User } from 'mantle';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { getUsers, removeUser, update, create } from '../store/users/actions';
import AdminActions from '../store/admin-actions/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
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

// Map state to props
const mapStateToProps = (state: IRootState, ownProps: any) => ({
  userState: state.users,
  auth: state.authentication,
  admin: state.admin,
  app: state.app,
});

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getUsers: getUsers,
  requestPasswordReset: AdminActions.requestPasswordReset,
  activate: AdminActions.activate,
  removeUser: removeUser,
  resendActivation: AdminActions.resendActivation,
  update,
  create,
};

const stateProps = returntypeof(mapStateToProps);
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  selectedUids: string[];
  userFilter: string;
  dialogue: null | string;
  dialogueHeader: string;
  dialogueConfirmBtn: string;
  newUserForm: boolean;
};

/**
 * The main application entry point
 */
@connectWrapper(mapStateToProps, dispatchToProps)
export class Users extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedUids: [],
      userFilter: '',
      newUserForm: false,
      dialogueHeader: '',
      dialogue: null,
      dialogueConfirmBtn: 'Ok',
    };
  }

  componentDidMount() {
    this.props.getUsers();
  }

  componentWillReceiveProps(next: Props) {}

  private onUserSelected(user: User, e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!e.ctrlKey && !e.shiftKey) {
      this.setState({ selectedUids: [user._id as string] });
    } else if (e.ctrlKey) {
      if (this.state.selectedUids.indexOf(user._id as string) === -1)
        this.setState({ selectedUids: this.state.selectedUids.concat(user._id as string) });
      else this.setState({ selectedUids: this.state.selectedUids.filter((i) => i !== user._id) });
    } else {
      const userPage = this.props.userState.userPage!;
      const selected = this.state.selectedUids;

      let firstIndex = Math.min(
        userPage.data.indexOf(user),
        selected.length > 0 ? userPage.data.findIndex((u) => u._id === selected[0]) : 0
      );
      let lastIndex = Math.max(
        userPage.data.indexOf(user),
        selected.length > 0 ? userPage.data.findIndex((u) => u._id === selected[0]) : 0
      );

      this.setState({ selectedUids: userPage.data.slice(firstIndex, lastIndex + 1).map((u) => u._id as string) });
    }
  }

  renderModal(onConfirm: () => void) {
    return (
      <Dialog className="mt-users-modal" open={true}>
        <DialogTitle>{this.state.dialogueHeader}</DialogTitle>
        <DialogContent>
          <DialogContentText className="mt-modal-message">{this.state.dialogue}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="mt-cancel" variant="contained" onClick={(e) => this.setState({ dialogue: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            className="mt-confirm"
            style={{ background: theme.error.background, color: theme.error.color }}
            onClick={(e) => {
              this.setState({ dialogue: null });
              onConfirm();
            }}
          >
            {this.state.dialogueConfirmBtn}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private renderUserList(selected: User | null) {
    const animated = this.props.app.debugMode ? false : true;
    const page = typeof this.props.userState.userPage! === 'string' ? null : this.props.userState.userPage!;
    const isBusy = this.props.userState.busy;

    return (
      <SplitPanel animated={animated}>
        <div>
          {page ? (
            <Pager
              limit={page.limit}
              loading={isBusy}
              onPage={(index) => this.props.getUsers(index)}
              index={page.index}
              total={page.count}
              contentProps={{ onMouseDown: (e) => this.setState({ selectedUids: [] }) }}
            >
              <UsersList
                users={page.data}
                selected={this.state.selectedUids}
                onUserSelected={(user, e) => this.onUserSelected(user, e)}
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
                this.props.requestPasswordReset(username);
              }}
              activateAccount={(username) => {
                this.props.activate(username);
              }}
              resendActivation={(username) => {
                this.props.resendActivation(username);
              }}
              updateUserAvatar={(userId, file) => this.props.update(userId, { avatarFile: file._id })}
              activeUser={this.props.auth.user!}
              updateUserDetails={(user) => this.props.update(user._id! as string, user)}
              onDeleteRequested={(user) => {
                this.setState({
                  dialogueHeader: 'Remove User',
                  dialogue: `Are you sure you want to remove the user '${user.username}', this action is irreversible?`,
                  dialogueConfirmBtn: `I Understand, Remove User`,
                });
              }}
              selected={selected}
            />
          </div>
        ) : undefined}
      </SplitPanel>
    );
  }

  private renderListHeader() {
    const isAdmin = this.props.auth.user && this.props.auth.user.privileges !== 'regular' ? true : false;
    const isBusy = this.props.userState.busy;

    return (
      <div>
        <TextField
          className="users-filter"
          style={{ verticalAlign: 'middle' }}
          placeholder="Filter username or email"
          id="mt-users-filter"
          value={this.state.userFilter}
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              this.setState({ selectedUids: [] }, () => {
                this.props.getUsers(0, this.state.userFilter);
              });
            }
          }}
          onChange={(e) => this.setState({ userFilter: e.currentTarget.value })}
        />
        <IconButton
          id="mt-users-search-button"
          onClick={(e) => {
            this.setState({ selectedUids: [] }, () => {
              this.props.getUsers(0, this.state.userFilter);
            });
          }}
          style={{ verticalAlign: 'middle' }}
        >
          <SearchIcon style={{ color: theme.primary200.background }} />
        </IconButton>
        {isAdmin ? (
          <Button
            variant="contained"
            onClick={(e) => this.setState({ newUserForm: true })}
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
  }

  private renderFormHeader() {
    return (
      <div>
        <Button
          style={{ margin: '5px 0 0 0' }}
          onClick={(e) => this.setState({ newUserForm: false })}
          id="mt-cancel-new-user"
        >
          <FontCancel />
          Back
        </Button>
      </div>
    );
  }

  render() {
    const isBusy = this.props.userState.busy;
    const selectedUids = this.state.selectedUids;
    const selected =
      selectedUids.length > 0
        ? this.props.userState.userPage!.data.find((u) => u._id === selectedUids[selectedUids.length - 1]) || null
        : null;

    return (
      <div style={{ height: '100%' }}>
        <ContentHeader
          title="Users"
          busy={isBusy}
          renderFilters={() => (this.state.newUserForm ? this.renderFormHeader() : this.renderListHeader())}
        />

        {this.state.newUserForm ? (
          <NewUserForm
            serverError={'There was an error babe'}
            onUserCreated={(newUser) => this.props.create(newUser, () => this.setState({ newUserForm: false }))}
            onCancel={() => this.setState({ newUserForm: false })}
          />
        ) : (
          this.renderUserList(selected)
        )}

        {this.state.dialogue
          ? this.renderModal(() => {
              this.props.removeUser(selected!.username);
            })
          : undefined}
      </div>
    );
  }
}

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
