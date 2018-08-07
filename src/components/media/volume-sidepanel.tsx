import * as React from 'react';
import { default as styled } from '../../theme/styled';
import theme from '../../theme/mui-theme';

export type Props = {
}

export type State = {
}

export default class VolumeSidePanel extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
  }

  render() {
    return (
      <Container>
      </Container>
    );
  }
}

const Container = styled.div`
  background: ${theme.light100.background };
  height: 100%;
`;