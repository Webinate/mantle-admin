import * as React from 'react';
import { IconButton, FontIcon } from 'material-ui';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';

export type Props = {
  offset: number;
  total: number;
  limit: number;
  onPage: ( offset: number ) => void;
  contentProps?: React.HTMLProps<HTMLDivElement>;
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



    return (
      <Container>
        <div {...this.props.contentProps}
          style={{ height: isOverflowing ? 'calc(100% - 50px)' : '100%', overflow: 'auto' }}
        >
          {this.props.children}
        </div>
        {isOverflowing ? (
          <Footer>
            <Text>
              {Math.min( ( offset + 1 ), total ) + '-' + Math.min( ( offset + limit ), total ) + ' of ' + total}
            </Text>
            <Buttons>
              <NavBtn>
                <IconButton
                  disabled={offset === 0}
                  onClick={e => this.props.onPage( this.props.offset - 1 )}
                >
                  <FontIcon className="icon-keyboard_arrow_left" />
                </IconButton>
              </NavBtn>
              <NavBtn>
                <IconButton
                  disabled={offset + limit >= total}
                  onClick={e => this.props.onPage( this.props.offset + 1 )}
                >
                  <FontIcon className="icon-keyboard_arrow_right" />
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
  position: relative;
`;

const Footer = styled.div`
  height: 50px;
  background: ${theme.light100.background };
  border-top: 1px solid ${theme.light100.border };
  box-sizing: border-box;
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