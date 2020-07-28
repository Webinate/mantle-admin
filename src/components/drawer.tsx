import * as React from 'react';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import IconButton from '@material-ui/core/IconButton';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';

type Props = {
  title: string;
  open: boolean;
  onHeaderClick: () => void;
  className?: string;
  animate?: boolean;
};

type State = {};

/**
 * An html component that represents the entire html page to be rendered
 */
export default class Drawer extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    animate: false,
  };

  private _shouldAnimate: boolean;

  constructor(props: Props) {
    super(props);
    this._shouldAnimate = props.animate!;
  }

  componentWillReceiveProps(next: Props) {
    if (next.open !== this.props.open) this._shouldAnimate = next.animate!;
    else this._shouldAnimate = false;
  }

  render() {
    return (
      <div className={this.props.className}>
        <DrawerHeader className="mt-drawer-header" onClick={() => this.props.onHeaderClick()}>
          <h3>{this.props.title}</h3>
          <IconButton>
            {this.props.open ? (
              <UpIcon
                style={{
                  color: 'inherit',
                }}
              />
            ) : (
              <DownIcon
                style={{
                  color: 'inherit',
                }}
              />
            )}
          </IconButton>
        </DrawerHeader>
        {this.props.open ? (
          <DrawerContent
            ref={(elm: HTMLDivElement) => {
              if (!elm) return;

              elm.style.maxHeight = '';
              const height = elm.clientHeight + 'px';
              elm.style.maxHeight = '0px';
              elm.style.visibility = 'visible';

              if (!this._shouldAnimate) elm.style.maxHeight = height;
              else setTimeout(() => (elm.style.maxHeight = height), 30);
            }}
          >
            {this.props.children}
          </DrawerContent>
        ) : undefined}
      </div>
    );
  }
}

const DrawerHeader = styled.div`
  cursor: pointer;
  user-select: none;
  display: flex;
  background: ${theme.primary100.background};
  color: ${theme.primary100.color};
  border-top: 1px solid ${theme.primary100.border};

  h3 {
    padding: 4px 10px;
    flex: 1;
  }
  > button {
    color: inherit;
    flex: 1;
    max-width: 50px;
  }
`;

const DrawerContent = styled.div`
  visibility: hidden;
  box-shadow: inset -2px 2px 5px 0px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  box-sizing: border-box;
  padding: 0 10px;
  transition: 0.25s max-height;
`;
