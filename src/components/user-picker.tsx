import * as React from 'react';
import { IUserEntry } from 'modepress';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import CloseIcon from '@material-ui/icons/Close';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import * as users from '../../../../src/lib-frontend/users';

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
  username: string;
};

export default class UserPicker extends React.Component<Props, State> {
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
      users: [],
      username: ''
    }
  }

  async onUpdateInput( user: string ) {
    const page = await users.getAll( { search: user } );
    this.setState( { username: user, users: page.data } );
  }

  private elm: HTMLElement | null;

  render() {
    // const suggestions = this.state.users.map( ( user, index ) => {
    //   return {
    //     text: user.username,
    //     value: (
    //       <MenuItem
    //         key={`user-${ index }`}
    //         className="mt-user-drop-item"
    //       >
    //       <ListItemIcon>
    //       <Avatar
    //           style={{background: theme.light400.background}}
    //           src={generateAvatarPic( user.avatar )}
    //         />
    //       </ListItemIcon>
    //       <ListItemText  primary={user.username}/>
    //       </MenuItem>
    //     ),
    //   }
    // } );

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
          margin: this.props.labelPosition === 'right' ? '0 5px 0 0' : '0 0 0 5px',
          background: theme.light400.background,
          height: this.props.imageSize,
          width: this.props.imageSize
        }}
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
        onClose={e => this.setState( { open: false } )}
      >
        <Input
          autoFocus={true}
          placeholder="Type user name"
          style={{ padding: 5 }}
          className="mt-user-autocomplete"
          value={this.state.username}
          onChange={e => this.onUpdateInput( e.currentTarget.value )}
        />
        <Menu
          open={this.state.users.length > 0 && this.state.open}

        >
          {this.state.users.map( ( user, index ) => {
            return (
              <MenuItem
                key={`user-${ index }`}
                onClick={e => {
                  this.props.onChange( user );
                  this.setState( { open: false, users: [] } );
                }}
              >
                <ListItemIcon>
                  <Avatar
                    style={{ background: theme.light400.background }}
                    src={generateAvatarPic( user.avatar )}
                  />
                </ListItemIcon>
                <ListItemText primary={user.username} />
              </MenuItem>
            )
          } )}
        </Menu>

        {/* <AutoComplete
          ref={( e: any ) => {
            if ( e ) {
              setTimeout( () => { e.refs.searchTextField && e.focus() }, 100 );
            }
          }}

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
        /> */}

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