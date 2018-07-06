import * as React from 'react';
import { default as styled } from '../theme/styled';
import theme from '../theme/mui-theme';

type Props = {
  value?: string;
  onChange: ( val: string ) => void;
}

type State = {
  editMode: boolean;
  value?: string;
}

/**
 * A form for entering user registration information
 */
export default class SlugEditor extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
      editMode: false,
      value: props.value
    }
  }

  render() {
    return (
      <SlugContainer>
        <strong>Slug: </strong>
        <i>http://host.net/</i>
        {!this.state.editMode ? (
          <span>
            <i className="mt-slug-value">{this.props.value}</i>
            {this.props.value!.length > 0 ?
              <span className="mt-slug-btn mt-edit-slug" onClick={e => {
                this.setState( {
                  editMode: true,
                  value: this.props.value
                } )
              }}
              >Edit</span> : undefined}
          </span>
        ) : (
            <span>
              <input
                autoFocus={true}
                onFocus={e => { e.currentTarget.select() }}
                name="mt-slug"
                value={this.state.value}
                onKeyUp={e => {
                  if ( e.keyCode === 13 ) {
                    this.setState( { editMode: false } );
                    this.props.onChange( this.state.value! );
                  }
                }}
                onChange={e => {
                  let cleanValue = e.currentTarget.value.replace( /\s+/g, '-' );
                  cleanValue = cleanValue.replace( /[^a-zA-Z0-9 -]/g, '' );
                  this.setState( { value: cleanValue } )
                }}
              />
              <span
                className="mt-slug-btn mt-slug-cancel"
                onClick={e => this.setState( { editMode: false } )}>
                Cancel
              </span>
              <span
                className="mt-slug-btn mt-slug-save"
                onClick={e => {
                  this.setState( { editMode: false } );
                  this.props.onChange( this.state.value! );
                }}>Save
              </span>
            </span>
          )}
      </SlugContainer>
    );
  }
}

const SlugContainer = styled.div`

  > strong {
    font-style: italic;
  }

  .mt-slug-value {
    margin: 0 10px 0 0;
  }

  .mt-slug-btn {
    background: ${theme.light100.background };
    color: ${theme.light100.color };
    border: 1px solid ${theme.light100.border };
    padding: 2px 4px;
    margin: 0 2px;
    border-radius: 2px;
    cursor: pointer;

    &:hover, &:active {
      border: 1px solid ${theme.primary100.border };
    }
  }

  .mt-slug-value {
    border-bottom: 1px solid ${theme.primary100.background };
  }
`;