import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Avatar, TextField, DatePicker, RaisedButton, IconButton } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import { Drawer } from './drawer';
import * as moment from 'moment';

type Props = {
  activeUser: IUserEntry;
  selected: IUserEntry | null;
  animated: boolean;
  resetPasswordRequest( username: string ): void;
  activateAccount( username: string ): void;
  onDeleteRequested( username: IUserEntry ): void;
  resendActivation( username: string ): void;
};

type State = {
  detailsOpen: boolean;
  accountsOpen: boolean;
  removeOpen: boolean;
}

export class UserProperties extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      detailsOpen: true,
      accountsOpen: false,
      removeOpen: false
    };
  }

  userCanInteract( user: IUserEntry ) {
    const activeUser = this.props.activeUser;

    // If admin
    if ( activeUser.privileges < 2 )
      return true;

    // If the same user
    if ( activeUser._id === user._id )
      return true;
  }

  render() {
    const selected = this.props.selected;

    if ( !selected )
      return <Properties />;

    const textStyle: React.CSSProperties = { color: '' };
    const underlineStyle: React.CSSProperties = { bottom: '4px' };

    return (
      <Properties className="mt-user-properties">

        <ImgContainer>
          <Avatar
            className="mt-avatar-image"
            src={generateAvatarPic( selected.avatar )}
            size={200}
          />
        </ImgContainer>
        <DetailsContainer>
          <Drawer
            title="User Details"
            animate={this.props.animated}
            open={this.state.detailsOpen}
            onHeaderClick={() => this.setState( { detailsOpen: !this.state.detailsOpen } )}
          >
            <Field>
              <TextField
                className="mt-props-username"
                floatingLabelStyle={textStyle}
                value={selected.username}
                floatingLabelText="Username"
                underlineStyle={underlineStyle}
              />
            </Field>
            {this.userCanInteract( selected ) ? <Field>
              <TextField
                className="mt-props-email"
                floatingLabelText="Email"
                floatingLabelStyle={textStyle}
                value={selected.email}
                underlineStyle={underlineStyle}
              />
            </Field> : undefined}
            <Field>
              <DatePicker
                floatingLabelText="Joined On"
                className="mt-joined-on"
                floatingLabelStyle={textStyle}
                mode="landscape"
                value={new Date( selected.createdOn )}
                formatDate={( date: Date ) => moment( date ).format( 'MMMM Do, YYYY' )}
              />
            </Field>
            {this.userCanInteract( selected ) ? <Field>
              <DatePicker
                floatingLabelText="Last Active"
                className="mt-last-active"
                floatingLabelStyle={textStyle}
                mode="landscape"
                value={new Date( selected.lastLoggedIn )}
                formatDate={( date: Date ) => moment( date ).format( 'MMMM Do, YYYY' )}
              />
            </Field> : undefined}
          </Drawer>

          {this.userCanInteract( selected ) ?
            <Drawer
              title="Account Settings"
              animate={this.props.animated}
              className="mt-account-settings"
              onHeaderClick={() => this.setState( { accountsOpen: !this.state.accountsOpen } )}
              open={this.state.accountsOpen}
            >
              <InlineField>
                <div className="mt-inline-label">Send password reset request</div>
                <div className="mt-inline-input">
                  <IconButton
                    onClick={() => this.props.resetPasswordRequest( selected.username )}
                    iconStyle={{ color: theme.primary200.background }}
                    tooltipPosition="top-left"
                    iconClassName="icon icon-mark-unread mt-reset-password"
                    tooltip="Email user"
                  />
                </div>
              </InlineField>

              {selected.registerKey !== '' && this.props.activeUser.privileges < 2 ?
                <InlineField>
                  <div className="mt-inline-label">Resend activation email</div>
                  <div className="mt-inline-input">
                    <IconButton
                      iconStyle={{ color: theme.primary200.background }}
                      tooltipPosition="top-left"
                      iconClassName="icon icon-mark-unread mt-resend-activation"
                      tooltip="Email user"
                      onClick={e => this.props.resendActivation( this.props.selected!.username )}
                    />
                  </div>
                </InlineField> : undefined}

              {selected.registerKey !== '' && this.props.activeUser.privileges < 2 ?
                <InlineField>
                  <div className="mt-inline-label">Activate Account</div>
                  <div className="mt-inline-input">
                    <IconButton
                      iconStyle={{ color: theme.primary200.background }}
                      tooltipPosition="top-left"
                      iconClassName="icon icon-done mt-activate-account"
                      tooltip="Activates the user"
                      onClick={e => this.props.activateAccount( this.props.selected!.username )}
                    />
                  </div>
                </InlineField> : undefined}

            </Drawer>
            : undefined}
          {this.userCanInteract( selected ) ? <Drawer
            title="Remove Account"
            animate={this.props.animated}
            className="mt-remove-account"
            onHeaderClick={() => this.setState( { removeOpen: !this.state.removeOpen } )}
            open={this.state.removeOpen}
          >
            <div className="mt-warning-message">
              Are you absolutely sure you want to remove this account - this is irreversible?
              <br />
              <RaisedButton
                backgroundColor={theme.error.background}
                labelColor={theme.error.color}
                label="Delete Account"
                className="mt-remove-acc-btn"
                onClick={e => this.props.onDeleteRequested( selected )}
              />
            </div>
          </Drawer> : undefined}
        </DetailsContainer>

      </Properties>
    );
  }
}

const Properties = styled.div`
  height: 100%;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  background: ${theme.light100.background };
  white-space: normal;

  .mt-warning-message {
    text-align: center;
    margin: 20px 0;
    color: ${theme.error.background };
    font-weight: bold;

    > div {
      margin: 10px 0;
    }
  }
`;

const Field = styled.div`
margin: 5px 0;
&:last-child {
  margin-bottom: 20px;
}
> div > label, > div > div > label {
  color: ${ theme.light100.softColor };
}
`;

const InlineField = styled.div`
margin: 15px 5px;
box-sizing: border-box;
display: table;
white-space: normal;
width: 100%;

> div {
  width: 50%;
  display: table-cell;
  vertical-align: middle;
}
.mt-inline-input { text-align: right; }
`;


const ImgContainer = styled.div`
  height: 250px;
  box-sizing: border-box;
  text-align: center;
  padding: 20px;
  background: linear-gradient(-45deg, ${theme.secondary100.background }, ${ theme.primary100.background });
`;


const DetailsContainer = styled.div`
  height: calc( 100% - 250px);
  overflow: auto;

  > h3 {
    margin: 0 0 6px 0;
    border-bottom: 1px solid ${ theme.light100.border };
    padding: 0 0 10px 0;
    text-transform: uppercase;
  }
`;