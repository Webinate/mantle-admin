import * as React from 'react';
import { default as styled } from '../theme/styled';
import LinearProgress from '@material-ui/core/LinearProgress';

type Props = {
  title: string;
  busy: boolean;
  renderFilters?: () => JSX.Element | JSX.Element[] | undefined | null;
  style?: React.CSSProperties;
  subPanelStyle?: React.CSSProperties;
  showSub?: boolean;
};

export default class ContentHeader extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    showSub: false
  };

  constructor(props: Props) {
    super(props);
  }

  render() {
    const showSub = this.props.showSub;

    return (
      <Container style={this.props.style} className="mt-content-header">
        <Header>
          <div>
            <h2>{this.props.title}</h2>
          </div>
          <div>{this.props.renderFilters && this.props.renderFilters()}</div>
        </Header>
        {showSub ? <div style={this.props.subPanelStyle}>{this.props.children}</div> : undefined}
        {this.props.busy ? (
          <div className="mt-loading" style={{ position: 'absolute', bottom: '0', width: '100%' }}>
            <LinearProgress />
          </div>
        ) : (
          undefined
        )}
      </Container>
    );
  }
}

const Container = styled.div`
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  position: relative;
  background: #fff;
  height: 50px;
  position: relative;
  z-index: 1;
  white-space: nowrap;
`;

const Header = styled.div`
  padding: 0 10px 0 20px;
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  > div {
    box-sizing: border-box;
    flex-basis: 0;
  }
  > div:last-child {
    flex-grow: 1;
    text-align: right;
  }
`;
