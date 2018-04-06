import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Avatar, Popover, AutoComplete, MenuItem } from 'material-ui';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import { users } from 'modepress/lib-frontend';

type Props = {
  user: IUserEntry;
  onChange: ( user: IUserEntry ) => void;
};

type State = {
  elm: Element | null;
  open: boolean;
  users: IUserEntry[];
};

export class UserPicker extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      elm: null,
      open: false,
      users: []
    }
  }

  async onUpdateInput( user: string ) {
    const page = await users.getAll( { search: user } );
    this.setState( { users: page.data } );
  }

  render() {
    const suggestions = this.state.users.map( ( user, index ) => {
      return {
        text: user.username,
        value: (
          <MenuItem
            key={`user-${ index }`}
            primaryText={user.username}
            rightAvatar={<Avatar
              backgroundColor={theme.light400.background}
              src={generateAvatarPic( user.avatar )}
            />}
          />
        ),
      }
    } );

    return <div
      style={{ padding: '0 0 0 5px', cursor: 'pointer' }}
      onClick={e => this.setState( { open: true, elm: e.currentTarget } )}
    >
      <span
        style={{ verticalAlign: 'middle' }}
      >{this.props.user.username}</span>
      <Avatar
        style={{
          verticalAlign: 'middle',
          margin: '0 0 0 5px'
        }}
        backgroundColor={theme.light400.background}
        src={generateAvatarPic( this.props.user.avatar )}
      />
      {this.state.open ? <Popover
        style={{ padding: 5 }}
        anchorEl={this.state.elm!}
        open={true}
        onRequestClose={e => this.setState( { open: false } )}
      >
        <AutoComplete
          style={{ padding: 5 }}
          hintText="Type user name"
          openOnFocus={true}
          autoFocus={true}
          dataSource={suggestions}
          onNewRequest={( item, index ) => {
            const user = this.state.users.find( e => e.username === item.text );
            if ( user ) {
              this.props.onChange( user );
            }

            this.setState( { open: false, users: [] } )
          }}
          filter={AutoComplete.noFilter}
          onUpdateInput={e => this.onUpdateInput( e )}
        />
      </Popover> : undefined}
    </div>;
  }
}