import * as React from 'react';
import { IUserEntry } from 'modepress';
import { IRootState } from '../store';
import { Avatar } from 'material-ui';
import { getUsers } from '../store/users/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { UsersList } from '../components/users-list';
import { ContentHeader } from '../components/content-header';
import { Pager } from '../components/pager';
import { Stage } from '../components/stage';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  userState: state.users
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  getUsers: getUsers
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  selectedUsers: IUserEntry[];
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Users extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      selectedUsers: []
    }
  }

  componentDidMount() {
    if ( this.props.userState!.users === 'not-hydrated' )
      this.props.getUsers!();
  }

  private onUserSelected( user: IUserEntry, e: React.MouseEvent<HTMLDivElement> ) {
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
      const users = this.props.userState!.users as IUserEntry[];
      const selected = this.state.selectedUsers;

      let firstIndex = Math.min( users.indexOf( user ), selected.length > 0 ? users.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( users.indexOf( user ), selected.length > 0 ? users.indexOf( selected[ 0 ] ) : 0 );

      this.setState( { selectedUsers: users.slice( firstIndex, lastIndex + 1 ) } );
    }
  }

  private getProperties() {
    const selected = this.state.selectedUsers.length > 0 ?
      this.state.selectedUsers[ this.state.selectedUsers.length - 1 ] : null;

    if ( !selected )
      return undefined;

    return (
      <Properties>
        <Avatar
          src="/images/avatar.svg"
          size={200}
        />
        <h2>{selected.username}</h2>
      </Properties>
    );
  }

  render() {
    const users = this.props.userState!.users;
    const selected = this.state.selectedUsers.length > 0 ?
      this.state.selectedUsers[ this.state.selectedUsers.length - 1 ] : null;

    return (
      <div style={{ height: '100%' }}>
        <ContentHeader title="Users" />
        <Stage
          rightOpen={selected ? true : false}
          leftOpen={false}
          style={{ height: 'calc(100% - 100px)' }}
          rightStyle={{ boxShadow: '-3px 5px 10px 0px rgba(0,0,0,0.2)' }}
          renderRight={() => this.getProperties()}
        >
          {users && users !== 'not-hydrated' ?
            <Pager
              limit={10}
              onPage={index => { }}
              offset={0}
              total={30}
              contentProps={{ onMouseDown: e => this.setState( { selectedUsers: [] } ) }
              }
            >
              <UsersList
                users={users}
                selected={this.state.selectedUsers}
                onUserSelected={( user, e ) => this.onUserSelected( user, e )}
              />
            </Pager> : undefined}
        </Stage>
      </div >
    );
  }
};

const Properties = styled.div`

height: 100%;
overflow: auto;
position: relative;
padding: 10px;
box-sizing: border-box;
background: ${theme.light100.background }
`;