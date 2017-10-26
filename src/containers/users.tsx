import * as React from 'react';
import { IRootState } from '../store';
import { getUsers } from '../store/users/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { UsersList } from '../components/users-list';
import { ContentHeader } from '../components/content-header';

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
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Users extends React.Component<Partial<Props>, State> {

  constructor( props: Props ) {
    super( props );
  }

  componentDidMount() {
    if ( this.props.userState!.users === 'not-hydrated' )
      this.props.getUsers!();
  }

  render() {
    const users = this.props.userState!.users;
    return (
      <div style={{ height: '100%' }}>
        <ContentHeader title="Users" />
        <div style={{ height: 'calc(100% - 100px)' }}>
          {users && users !== 'not-hydrated' ? <UsersList users={users} /> : undefined}
        </div>
      </div>
    );
  }
};