import * as React from 'react';
import { default as styled } from '../theme/styled';
import theme from '../theme/mui-theme';

type Props = {
  value?: string;
  onChange: ( val: string ) => void;
}
type State = {
}

/**
 * A form for entering user registration information
 */
export class SlugEditor extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
    }
  }

  render() {
    return (
      <SlugContainer>
        <strong>Slug: </strong>
        <i>http://host.net/</i>
        <i className="mt-slug-value">{this.props.value}</i>
      </SlugContainer>
    );
  }
}

const SlugContainer = styled.div`
  margin: 5px 0 20px 0;

  > strong {
    font-style: italic;
  }

  .mt-slug-value {
    border-bottom: 1px solid ${theme.primary100.background };
  }
`;