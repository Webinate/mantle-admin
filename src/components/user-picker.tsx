import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Avatar, Popover, AutoComplete, MenuItem } from 'material-ui';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import { users } from 'modepress/src/lib-frontend';

type Props = {
  user: IUserEntry<'client'>;
  canEdit?: boolean;
  onChange: ( user: IUserEntry<'client'> ) => void;
  labelStyle?: React.CSSProperties;
};

type State = {
  elm: Element | null;
  open: boolean;
  users: IUserEntry<'client'>[];
};

export class UserPicker extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    canEdit: true
  };


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

  private elm: HTMLElement | null;

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
      ref={e => this.elm = e}
      style={{
        display: 'inline-block',
        padding: '0 0 0 5px',
        cursor: this.props.canEdit ? 'pointer' : ''
      }}
      onClick={this.props.canEdit ? e => {
        this.setState( { open: true, elm: e.currentTarget }, () => {
          this.onUpdateInput( '' );
        } );
      } : undefined}
    >
      <span
        style={{ verticalAlign: 'middle', ...this.props.labelStyle }}
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
        anchorEl={this.elm!}
        open={true}
        onRequestClose={e => this.setState( { open: false } )}
      >
        <AutoComplete
          ref={( e: any ) => {
            if ( e ) {
              setTimeout( () => { e.refs.searchTextField && e.focus() }, 100 );
            }
          }}
          style={{ padding: 5 }}
          hintText="Type user name"
          openOnFocus={true}
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