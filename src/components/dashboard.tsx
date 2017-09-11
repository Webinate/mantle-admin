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
      <DashboardOuter>
        <Head>
          <IconButton
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
        <Body>
          <Menu>
            <List>
              {this.props.items.map(( i, index ) => {
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
        </Body>
      </DashboardOuter>
    )
  }
}

const DashboardOuter = styled.div`
  height: 100%;
  position: relative;
`;

const Head = styled.div`
  background: linear-gradient(-325deg, #f09b74, #c96969, #765b90);
  height: 60px;
  position: relative;
  color: #fff;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);

  > * {
    display: inline-block;
    vertical-align: middle;
  }

  > h1 {
    margin: 9px 0 0 0;
    font-weight: 400;
  }
`;

const Menu = styled.div`
  float: left;
  width: 200px;
  height: 100%;
  background: #efefef;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
`;

const Body = styled.div`
height: calc(100% - 60px);

${ Menu } .selected {
  color: white !important;
  background: ${ theme.palette!.primary1Color! } !important;
}
`;

const Content = styled.div`
  float: left;
  width: calc(100% - 200px);
  height: 100%;
  overflow: auto;
  padding: 0 10px;
  box-sizing: border-box;
`;