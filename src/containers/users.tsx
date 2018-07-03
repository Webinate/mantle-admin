import * as React from 'react';
import { IUserEntry } from 'modepress';
import { IRootState } from '../store';
import theme from '../theme/mui-theme';
import { getUsers, removeUser } from '../store/users/actions';
import { requestPasswordReset, activate, resendActivation } from '../store/admin-actions/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { UsersList } from '../components/users-list';
import { ContentHeader } from '../components/content-header';
import { Pager } from '../components/pager';
import { UserProperties } from '../components/users-properties';
import { SplitPanel } from '../components/split-panel';
import { TextField, IconButton, LinearProgress, Dialog, Button, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  userState: state.users,
  auth: state.authentication,
  admin: state.admin,
  app: state.app
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getUsers: getUsers,
  requestPasswordReset: requestPasswordReset,
  activate: activate,
  removeUser: removeUser,
  resendActivation: resendActivation
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  selectedUsers: IUserEntry<'client'>[];
  userFilter: string;
  dialogue: null | string;
  dialogueHeader: string;
  dialogueConfirmBtn: string;
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Users extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      selectedUsers: [],
      userFilter: '',
      dialogueHeader: '',
      dialogue: null,
      dialogueConfirmBtn: 'Ok'
    }
  }

  componentDidMount() {
    this.props.getUsers();
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.userState.userPage !== this.props.userState.userPage )
      this.setState( { selectedUsers: [] } );
  }

  private onUserSelected( user: IUserEntry<'client'>, e: React.MouseEvent<HTMLDivElement> ) {
    e.preventDefault();
    e.stopPropagation();

    if ( !e.ctrlKey && !e.shiftKey ) {
      this.setState( { selectedUsers: [ user ] } );
    }
    else if ( e.ctrlKey ) {
      if ( this.state.selectedUsers.indexOf( user ) === -1 )
        this.setState( { selectedUsers: this.state.selectedUsers.concat( user ) } );
      else
        this.setState( { selectedUsers: this.state.selectedUsers.filter( i => i !== user ) } );
    }
    else {
      const userPage = this.props.userState.userPage!;
      const selected = this.state.selectedUsers;

      let firstIndex = Math.min( userPage.data.indexOf( user ), selected.length > 0 ? userPage.data.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( userPage.data.indexOf( user ), selected.length > 0 ? userPage.data.indexOf( selected[ 0 ] ) : 0 );

      this.setState( { selectedUsers: userPage.data.slice( firstIndex, lastIndex + 1 ) } );
    }
  }

  renderModal( onConfirm: () => void ) {


    return (
      <Dialog
        className="mt-users-modal"
        open={true}
      >
        <DialogTitle>{this.state.dialogueHeader}</DialogTitle>
        <DialogContent>
          <DialogContentText className="mt-modal-message">
            {this.state.dialogue}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            className="mt-cancel"
            variant="contained" color="primary"
            onClick={e => this.setState( { dialogue: null } )}
          >Cancel</Button>
          <Button
            variant="contained"
            className="mt-confirm"
            style={{ background: theme.error.background, color: theme.error.color }}
            onClick={e => {
              this.setState( { dialogue: null } );
              onConfirm();
            }}
          >{this.state.dialogueConfirmBtn}</Button>
        </DialogActions>
      </Dialog>
    );
  }

  render() {
    const page = ( typeof ( this.props.userState.userPage! ) === 'string' ? null : this.props.userState.userPage! );
    const isBusy = this.props.userState.busy;
    const selected = this.state.selectedUsers.length > 0 ?
      this.state.selectedUsers[ this.state.selectedUsers.length - 1 ] : null;

    return (
      <div style={{ height: '100%' }}>
        <ContentHeader
          title="Users"
          busy={isBusy}
          renderFilters={() => {
            return <div>
              <TextField
                className="users-filter"
                helperText="Filter username or email"
                id="mt-users-filter"
                value={this.state.userFilter}
                onKeyDown={e => {
                  if ( e.keyCode === 13 )
                    this.props.getUsers( 0, this.state.userFilter )
                }}
                onChange={( e ) => this.setState( { userFilter: e.currentTarget.value } )}
              />
              <IconButton
                id="mt-users-search-button"
                onClick={e => this.props.getUsers( 0, this.state.userFilter )}
                style={{ verticalAlign: 'top' }}
              >
                <SearchIcon style={{ color: theme.primary200.background }} />
              </IconButton>
            </div>
          }}>
        </ContentHeader>
        <SplitPanel
          collapsed={selected ? 'none' : 'right'}
          ratio={0.7}
          style={{ height: 'calc(100% - 50px)' }}
          rightStyle={{ boxShadow: '-3px 5px 10px 0px rgba(0,0,0,0.2)' }}
          first={() => {
            return page ?
              <Pager
                limit={page.limit}
                loading={isBusy}
                onPage={index => this.props.getUsers( index )}
                index={page.index}
                total={page.count}
                contentProps={{ onMouseDown: e => this.setState( { selectedUsers: [] } ) }
                }
              >
                {isBusy ? <div className="mt-loading"><LinearProgress /></div> : undefined}
                <UsersList
                  users={page.data}
                  selected={this.state.selectedUsers}
                  onUserSelected={( user, e ) => this.onUserSelected( user, e )}
                />
              </Pager>
              : undefined
          }}
          second={() => <UserProperties
            animated={this.props.app.debugMode ? false : true}
            resetPasswordRequest={username => { this.props.requestPasswordReset( username ) }}
            activateAccount={username => { this.props.activate( username ) }}
            resendActivation={username => { this.props.resendActivation( username ) }}
            activeUser={this.props.auth.user!}
            onDeleteRequested={( user ) => {
              this.setState( {
                dialogueHeader: 'Remove User',
                dialogue: `Are you sure you want to remove the user '${ user.username }', this action is irreversible?`,
                dialogueConfirmBtn: `I Understand, Remove User`
              } )
            }}
            selected={selected}
          />
          }
        />
        {this.state.dialogue ?
          this.renderModal( () => {
            this.props.removeUser( selected!.username )
          } ) : undefined}
      </div >
    );
  }
};