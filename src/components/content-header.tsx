import * as React from 'react';
import { default as styled } from '../theme/styled';

type Props = {
  title: string;
  renderFilters?: () => JSX.Element | undefined | null;
  style?: React.CSSProperties;
  subPanelStyle?: React.CSSProperties;
  showSub?: boolean;
}

export class ContentHeader extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    showSub: false
  }

  constructor( props: Props ) {
    super( props );
  }

  render() {
    const showSub = this.props.showSub;

    return (
      <Container style={this.props.style} className="mt-content-header">
        <Header>
          <div>
            <h2>{this.props.title}</h2>
          </div>
          <div>
            {this.props.renderFilters && this.props.renderFilters()}
          </div>
        </Header>
        {
          showSub ?
            <div style={this.props.subPanelStyle}>
              {this.props.children}
            </div> : undefined
        }

      </Container>
    )
  }
}

const Container = styled.div`
  box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.3);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  background: #fff;
  height: 50px;
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  overflow: hidden;
  padding: 0 20px;
  display: table;
  width: 100%;
  box-sizing: border-box;

  > div {
    display: table-cell;
    width: 50%;
    box-sizing: border-box;
  }
  > div:last-child {
    text-align: right;
  }
`;