import * as React from 'react';
import { IUserEntry } from 'modepress';
import { Avatar, TextField, DatePicker, RaisedButton } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import { Drawer } from './drawer';

type Props = {
  users: IUserEntry[] | null;
  selectedIndex: number | null;
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

  render() {
    const users = this.props.users;
    const selectedIndex = this.props.selectedIndex;

    if ( selectedIndex === null || !users )
      return <Properties />;

    const selected = users[ selectedIndex ];

    if ( !selected )
      return <Properties />;

    const textStyle: React.CSSProperties = { color: '' };
    const underlineStyle: React.CSSProperties = { bottom: '4px' };

    return (
      <Properties className="mt-user-properties">
        <ImgContainer>
          <Avatar
            src={generateAvatarPic( selectedIndex )}
            size={200}
          />
        </ImgContainer>
        <DetailsContainer>
          <Drawer
            title="User Details"
            open={this.state.detailsOpen}
            onHeaderClick={() => this.setState( { detailsOpen: !this.state.detailsOpen } )}
          >
            <Field>
              <TextField
                name="username"
                floatingLabelStyle={textStyle}
                value={selected.username}
                floatingLabelText="Username"
                underlineStyle={underlineStyle}
              />
            </Field>
            <Field>
              <TextField
                name="email"
                floatingLabelText="Email"
                floatingLabelStyle={textStyle}
                value={selected.email}
                underlineStyle={underlineStyle}
              />
            </Field>
            <Field>
              <DatePicker
                floatingLabelText="Joined On"
                floatingLabelStyle={textStyle}
                mode="landscape"
                value={new Date( selected.createdOn )}
              />
            </Field>
            <Field>
              <DatePicker
                floatingLabelText="Last Active"
                floatingLabelStyle={textStyle}
                mode="landscape"
                value={new Date( selected.lastLoggedIn )}
              />
            </Field>
          </Drawer>

          <Drawer
            title="Account Settings"
            onHeaderClick={() => this.setState( { accountsOpen: !this.state.accountsOpen } )}
            open={this.state.accountsOpen}
          >
            <InlineField>
              <div className="mt-inline-label">Send password reset request</div>
              <div className="mt-inline-input">
                <RaisedButton label="Send Reset" primary={true} />
              </div>
            </InlineField>

            <InlineField>
              <div className="mt-inline-label">Send activation email</div>
              <div className="mt-inline-input">
                <RaisedButton label="Send Activation" primary={true} />
              </div>
            </InlineField>
          </Drawer>

          <Drawer
            title="Remove Account"
            onHeaderClick={() => this.setState( { removeOpen: !this.state.removeOpen } )}
            open={this.state.removeOpen}
          >
            <strong>
              Are you absolutely sure you want to remove this account - this is irreversible?
            </strong>
          </Drawer>
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

  strong {
    margin: 20px 0;
  }
`;

const Field = styled.div`
margin: 5px 0;
> div > label, > div > div > label {
  color: ${ theme.light100.softColor };
}
`;

const InlineField = styled.div`
margin: 20px 5px;
clear: both;
overflow: hidden;
box-sizing: border-box;

button {
  min-width: 200px;
}

> div {
  overflow: hidden;
  width: 50%;
  float: left;
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