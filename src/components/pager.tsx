import * as React from 'react';
import { IconButton, Button } from '@material-ui/core';
import { default as styled } from '../theme/styled';
import { default as theme } from '../theme/mui-theme';
import LeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';

export type Props = {
  index: number;
  total: number;
  limit: number;
  loading: boolean;
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
    const index = this.props.index;
    const total = this.props.total;
    const limit = this.props.limit;
    const isOverflowing = !( ( index === 0 ) && ( index + limit >= total ) );

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
              {Math.min( ( index + 1 ), total ) + '-' + Math.min( ( index + limit ), total ) + ' of ' + total}
            </Text>
            <Buttons>
              <NavBtn>
                <Button
                  className="mt-pager-first"
                  style={{ minWidth: '54px' }}
                  disabled={this.props.loading || index === 0}
                  onClick={e => {
                    this.props.onPage( 0 )
                  }}
                >First</Button>
              </NavBtn>

              <NavBtn>
                <Button
                  className="mt-pager-last"
                  style={{ minWidth: '54px' }}
                  disabled={this.props.loading || index + limit >= total}
                  onClick={e => {
                    this.props.onPage( total - ( total % limit ) )
                  }}
                >Last</Button>
              </NavBtn>

              <NavBtn>
                <IconButton
                  className="mt-pager-prev"
                  disabled={this.props.loading || index === 0}
                  onClick={e => {
                    this.props.onPage( index - limit )
                  }}
                >
                  <LeftIcon />
                </IconButton>
              </NavBtn>

              <NavBtn>
                <IconButton
                  className="mt-pager-next"
                  disabled={this.props.loading || index + limit >= total}
                  onClick={e => {
                    this.props.onPage( index + limit )
                  }}
                >
                  <RightIcon />
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
  padding: 0 10px;
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

  > button {
    vertical-align: middle;
  }
`;