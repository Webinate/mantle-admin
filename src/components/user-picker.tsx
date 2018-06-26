import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Avatar, Popover, AutoComplete, MenuItem, IconButton } from 'material-ui';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import { users } from 'modepress/src/lib-frontend';

type Props = {
  user: IUserEntry<'client'> | null;
  canEdit?: boolean;
  onChange: ( user: IUserEntry<'client'> | null ) => void;
  labelStyle?: React.CSSProperties;
  labelPosition?: 'right' | 'left';
  imageSize?: number;
};

type State = {
  elm: Element | null;
  open: boolean;
  users: IUserEntry<'client'>[];
};

export class UserPicker extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    canEdit: true,
    labelPosition: 'left',
    imageSize: 40
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
            className="mt-user-drop-item"
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
      className="my-user-picker-btn"
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
      {this.props.labelPosition === 'left' ? <span
        className="my-user-picker-label"
        style={{ verticalAlign: 'middle', ...this.props.labelStyle }}
      >
        {this.props.user ? this.props.user.username : 'Not set '}
      </span> : undefined}
      <Avatar
        style={{
          verticalAlign: 'middle',
          margin: this.props.labelPosition === 'right' ? '0 5px 0 0' : '0 0 0 5px'
        }}
        size={this.props.imageSize}
        backgroundColor={theme.light400.background}
        src={generateAvatarPic( this.props.user ? this.props.user.avatar : null )}
      />
      {this.props.labelPosition === 'right' ? <span
        className="my-user-picker-label"
        style={{ verticalAlign: 'middle', ...this.props.labelStyle }}
      >
        {this.props.user ? this.props.user.username : ' Not Set'}
      </span> : undefined}


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
          className="mt-user-autocomplete"
          style={{ padding: 5 }}
          hintText="Type user name"
          openOnFocus={true}
          dataSource={suggestions}
          onNewRequest={( item, index ) => {
            const user = this.state.users.find( e => e.username === item.text );
            if ( user ) {
              this.props.onChange( user );
            }

            this.setState( { open: false, users: [] } );
          }}
          filter={AutoComplete.noFilter}
          onUpdateInput={e => this.onUpdateInput( e )}
        />
        <IconButton onClick={e => {
          this.props.onChange( null );
          this.setState( { open: false, users: [] } );
        }}>
          <CloseIcon />
        </IconButton>
      </Popover> : undefined}
    </div>;
  }
}