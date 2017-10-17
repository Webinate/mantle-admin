import * as React from 'react';
import { IconButton, List, ListItem, FontIcon } from 'material-ui'
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';

type Prop = {
  activePath: string;
  title: string;
  items: { label: string, icon: string, path: string; onClick: () => void }[],
  onHome: () => void;
  onLogOut: () => void;
}

export class Dashboard extends React.Component<Prop, any> {
  constructor() {
    super();
  }

  render() {
    return (
      <DashboardOuter className="mt-dashboard">
        <Head>
          <IconButton
            className="mt-logout"
            style={{ color: 'inherit', margin: '5px', float: 'right' }}
            iconStyle={{ color: 'inherit' }}
            onClick={e => this.props.onLogOut()}
            iconClassName="icon-sign-out"
          />
          <IconButton
            style={{ color: 'inherit' }}
            iconStyle={{ color: 'inherit', fontSize: '30px', lineHeight: '30px' }}
            onClick={e => this.props.onHome()}
            iconClassName="icon-mantle-solid"
          />
          <h1>{this.props.title}</h1>
        </Head>
        <Menu>
          <List style={{ padding: '0' }}>
            {this.props.items.map( ( i, index ) => {
              return <ListItem
                className={this.props.activePath === i.path ? 'selected' : ''}
                key={`menu-item-${ index }`}
                onClick={e => i.onClick()}
                primaryText={i.label}
                leftIcon={<FontIcon style={{ color: 'inherit', transition: '' }} className={i.icon}
                />} />
            } )
            }
          </List>
        </Menu>
        <Content>
          {this.props.children}
        </Content>
        <Properties>
        </Properties>

      </DashboardOuter>
    )
  }
}

const DashboardOuter = styled.div`
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 1fr 1fr minmax(100px, 1fr);
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    "header header header header"
    "sections main main props";
  height: 100%;
`;

const Head = styled.div`
  background: ${theme.primary200.background };
  color: ${theme.primary200.color };
  border-bottom: 1px solid ${theme.primary200.border! };
  box-sizing: border-box;
  grid-area: header;

  > * {
    display: inline-block;
    vertical-align: middle;
  }

  > h1 {
    margin: 9px 0 0 0;
    font-weight: 300;
  }
`;

const Menu = styled.div`
  grid-area: sections;
  background: ${theme.light100.background };
  border-right: 1px solid ${theme.light100.border! };
  overflow: auto;

  > div > div .selected {
    color: ${ theme.secondary200.color } !important;
    background: ${ theme.secondary200.background } !important;
  }

  > div > div .selected::before {
    content: '';
    position: absolute;
    height: 100%;
    box-sizing: border-box;
    border-left: 8px solid ${ theme.secondary100.background };
  }
`;

const Properties = styled.div`
  grid-area: props;
`;

const Content = styled.div`
  grid-area: main;
  overflow: auto;
  padding: 0 10px;
  box-sizing: border-box;
  box-shadow: 0px 1px 10px 1px rgba(0,0,0,0.2) inset;
  background: ${ theme.light200.background } !important;
`;