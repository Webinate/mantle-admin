import * as React from 'react';
import { default as styled } from '../theme/styled';
import { IconButton } from 'material-ui';

type Props = {
  title: string;
  open: boolean;
  onHeaderClick: () => void;
}

type State = {
};

/**
 * An html component that represents the entire html page to be rendered
 */
export class Drawer extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
  }

  render() {
    return <div>
      <DrawerHeader onClick={() => this.props.onHeaderClick()}>
        <IconButton
          iconClassName={this.props.open ? 'icon icon-arrow-down' : 'icon icon-arrow-right'}
          iconStyle={{
            width: 30,
            height: 30,
          }}
          style={{
            width: 30,
            height: 30,
            padding: 0,
          }}
        />
        <h3>{this.props.title}</h3>
      </DrawerHeader>
      {this.props.open ?
        <DrawerContent>
          {this.props.children}
        </DrawerContent> : undefined}
    </div>;
  }
}

const DrawerHeader = styled.div`
  padding: 10px;

  h3 {
    margin: 2px 0;
  }
  > button {
    float: right;
  }
`;

const DrawerContent = styled.div`
  box-shadow: inset 0px 2px 5px 0px rgba(0,0,0,0.2);
  overflow: auto;
  box-sizing: border-box;
  padding: 0 10px;
`;