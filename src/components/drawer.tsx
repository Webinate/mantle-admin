import * as React from 'react';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import { IconButton } from 'material-ui';

type Props = {
  title: string;
  open: boolean;
  onHeaderClick: () => void;
  className?: string;
}

type State = {
};

/**
 * An html component that represents the entire html page to be rendered
 */
export class Drawer extends React.Component<Props, State> {
  private _shouldAnimate: boolean;

  constructor( props: Props ) {
    super( props );
    this._shouldAnimate = true;
  }

  componentWillReceiveProps( next: Props ) {
    if ( next.open !== this.props.open )
      this._shouldAnimate = true;
    else
      this._shouldAnimate = false;
  }

  render() {
    return <div className={this.props.className}>
      <DrawerHeader className="mt-drawer-header" onClick={() => this.props.onHeaderClick()}>
        <IconButton
          iconClassName={this.props.open ? 'icon icon-arrow-down' : 'icon icon-arrow-right'}
          iconStyle={{
            width: 30,
            height: 30,
            color: 'inherit'
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
        <DrawerContent innerRef={
          ( elm: HTMLDivElement ) => {
            if ( !elm )
              return;

            elm.style.maxHeight = '';
            const height = elm.clientHeight + 'px';
            elm.style.maxHeight = '0px'
            elm.style.visibility = 'visible';

            if ( !this._shouldAnimate )
              elm.style.maxHeight = height;
            else
              setTimeout( () => elm.style.maxHeight = height, 30 );
          }
        }>
          {this.props.children}
        </DrawerContent> : undefined}
    </div>;
  }
}

const DrawerHeader = styled.div`
  padding: 10px;
  cursor: pointer;
  user-select: none;
  background: ${theme.primary100.background };
  color: ${theme.primary100.color };
  border-top: 1px solid ${theme.primary100.border };
  h3 {
    margin: 2px 0;
  }
  > button {
    float: right;
    color: inherit;
  }
`;

const DrawerContent = styled.div`
  visibility: hidden;
  box-shadow: inset -2px 2px 5px 0px rgba(0,0,0,0.2);
  overflow: hidden;
  box-sizing: border-box;
  padding: 0 10px;
  transition: 0.25s max-height;
`;