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
}

export class UserProperties extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      detailsOpen: false,
      accountsOpen: false
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
              />
            </Field>
            <Field>
              <TextField
                floatingLabelText="Email"
                floatingLabelStyle={textStyle}
                value={selected.email}
              />
            </Field>
            <Field>
              <TextField
                floatingLabelText="Password Tag"
                floatingLabelStyle={textStyle}
                value={selected.passwordTag}
              />
            </Field>
            <Field>
              <TextField
                floatingLabelText="Session ID"
                floatingLabelStyle={textStyle}
                value={selected.sessionId}
                disabled={true}
              />
            </Field>
            <Field>
              <DatePicker
                floatingLabelText="Joined On"
                floatingLabelStyle={textStyle}
                disabled={true}
                mode="landscape"
                value={new Date( selected.createdOn )}
              />
            </Field>
            <Field>
              <DatePicker
                floatingLabelText="Last Active"
                floatingLabelStyle={textStyle}
                disabled={true}
                mode="landscape"
                value={new Date( selected.lastLoggedIn )}
              />
            </Field>
            <EditButtons>
              <RaisedButton label="Edit" primary={true} />
            </EditButtons>
          </Drawer>
          <Drawer
            title="Account Settings"
            onHeaderClick={() => this.setState( { accountsOpen: !this.state.accountsOpen } )}
            open={this.state.accountsOpen}
          >
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
`;

const Field = styled.div`
margin: 5px 0;
> div > label, > div > div > label {
  font-weight: bold;
  color: ${ theme.light100.softColor };
}
`;

const ImgContainer = styled.div`
  height: 250px;
  box-sizing: border-box;
  text-align: center;
  padding: 20px;
  background: linear-gradient(-45deg, ${theme.secondary100.background }, ${ theme.primary100.background });
`;

const EditButtons = styled.div`
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  border-top: 1px solid ${ theme.light100.border };
  text-align: right;
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