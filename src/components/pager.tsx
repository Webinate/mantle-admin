import * as React from 'react';
import { IconButton, FontIcon } from 'material-ui';
import { default as styled } from '../theme/styled';

export type Props = {
  offset: number;
  total: number;
  limit: number;
  onPage: ( offset: number ) => void;
}

interface ContainerProps extends React.HTMLProps<HTMLDivElement> {
  isOverflowing: boolean;
}

type State = {
}

/**
 * A component for paging through large datasets
 */
export class Pager extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
    };
  }

  render() {
    const offset = this.props.offset * this.props.limit;
    const total = this.props.total;
    const limit = this.props.limit;
    const isOverflowing = !( ( offset === 0 ) && ( offset + limit >= total ) );

    const iconStyle: React.CSSProperties = {
      background: 'inherit',
      lineHeight: '12px',
      border: '1px solid #ddd',
      padding: '12px 0',
      color: 'inherit'
    };

    return (
      <Container>
        <Content isOverflowing={isOverflowing}>
          {this.props.children}
        </Content>
        {isOverflowing ? (
          <Footer>
            <Text>
              {Math.min( ( offset + 1 ), total ) + '-' + Math.min( ( offset + limit ), total ) + ' of ' + total}
            </Text>
            <Buttons>
              <NavBtn>
                <IconButton
                  style={iconStyle}
                  disabled={offset === 0}
                  onClick={e => this.props.onPage( this.props.offset - 1 )}
                >
                  <FontIcon style={{ color: 'inherit' }} className="icon-keyboard_arrow_left" />
                </IconButton>
              </NavBtn>
              <NavBtn>
                <IconButton
                  style={iconStyle}
                  disabled={offset + limit >= total}
                  onClick={e => this.props.onPage( this.props.offset + 1 )}
                >
                  <FontIcon style={{ color: 'inherit' }} className="icon-keyboard_arrow_right" />
                </IconButton>
              </NavBtn>
            </Buttons>
          </Footer>
        ) : undefined}
      </Container>
    );
  }
}

const Container = styled.div`
  height: 100%;
`;

const Content = styled.div`
  height: ${ ( props: ContainerProps ) => props.isOverflowing ? 'calc(100% - 50px)' : '100%' };
  overflow: auto;
`;

const Footer = styled.div`
  height: 50px;
`;

const Buttons = styled.div`
  float: right;
`;

const Text = styled.div`
  float: left;
  margin: 16px 0 0 0;
`;

const NavBtn = styled.div`
  margin: 0 0 0 5px;
  display: inline-block;
`;