import * as React from 'react';
import { UserTokens, IUserEntry } from 'modepress';
import { IRootState } from '../store';
import { getUsers } from '../store/users/actions';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { UsersList } from '../components/users-list';
import { ContentHeader } from '../components/content-header';
import { Pager } from '../components/pager';
import { UserProperties } from '../components/users-properties';
import { SplitPanel } from '../components/split-panel';

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

  componentWillMount() {
    if ( this.props.userState!.userPage === 'not-hydrated' )
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
      const userPage = this.props.userState!.userPage as UserTokens.GetAll.Response;
      const selected = this.state.selectedUsers;

      let firstIndex = Math.min( userPage.data.indexOf( user ), selected.length > 0 ? userPage.data.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( userPage.data.indexOf( user ), selected.length > 0 ? userPage.data.indexOf( selected[ 0 ] ) : 0 );

      this.setState( { selectedUsers: userPage.data.slice( firstIndex, lastIndex + 1 ) } );
    }
  }

  render() {
    const page = ( typeof ( this.props.userState!.userPage! ) === 'string' ? null : this.props.userState!.userPage! as UserTokens.GetAll.Response );

    const selected = this.state.selectedUsers.length > 0 ?
      this.state.selectedUsers[ this.state.selectedUsers.length - 1 ] : null;

    return (
      <div style={{ height: '100%' }}>
        <ContentHeader title="Users" />
        <SplitPanel
          collapsed={selected ? 'none' : 'right'}
          ratio={0.7}
          style={{ height: 'calc(100% - 100px)' }}
          rightStyle={{ boxShadow: '-3px 5px 10px 0px rgba(0,0,0,0.2)' }}
          first={() => {
            return page ?
              <Pager
                limit={page.limit}
                onPage={index => this.props.getUsers!( index )}
                offset={page.index}
                total={page.count}
                contentProps={{ onMouseDown: e => this.setState( { selectedUsers: [] } ) }
                }
              >
                <UsersList
                  users={page.data}
                  selected={this.state.selectedUsers}
                  onUserSelected={( user, e ) => this.onUserSelected( user, e )}
                />
              </Pager>
              : undefined
          }}
          second={() => <UserProperties
            selectedIndex={page && selected ? page.data.indexOf( selected ) : -1}
            users={page ? page.data : null}
          />
          }
        />
      </div >
    );
  }
};