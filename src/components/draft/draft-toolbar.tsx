import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import { DraftBlockType, DraftInlineStyle } from 'draft-js';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

type Props = {
  onCreateBlock: ( type: BlockType ) => void;
  onInlineToggle: ( type: InlineType ) => void;
  activeBlockType: DraftBlockType;
  activeStyle: DraftInlineStyle;
  animate?: boolean;
}

type State = {
  anchorEl: HTMLElement | undefined;
};

export type BlockType = {
  label: string;
  type: DraftBlockType
}

export type InlineType = {
  label: string;
  type: 'BOLD' | 'ITALIC' | 'UNDERLINE'
}

/**
 * An html component that represents the entire html page to be rendered
 */
export default class DraftToolbar extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    animate: false
  }
  private _blockTypes: BlockType[];
  private _inlineStyles: InlineType[];

  constructor( props: Props ) {
    super( props );

    this._blockTypes = [
      { label: 'Header 1', type: 'header-one' },
      { label: 'Header 2', type: 'header-two' },
      { label: 'Header 3', type: 'header-three' },
      { label: 'Header 4', type: 'header-four' },
      { label: 'Header 5', type: 'header-five' },
      { label: 'Header 6', type: 'header-six' },
      { label: 'Blockquote', type: 'blockquote' },
      { label: 'Unordered List', type: 'unordered-list-item' },
      { label: 'Ordered List', type: 'ordered-list-item' },
      { label: 'Code Block', type: 'code-block' },
      { label: 'Paragraph', type: 'paragraph' }
    ];

    this._inlineStyles = [
      { label: 'B', type: 'BOLD' },
      { label: 'I', type: 'ITALIC' },
      { label: 'U', type: 'UNDERLINE' }
    ];

    this.state = {
      anchorEl: undefined
    };
  }

  private handleClick( event: React.MouseEvent<HTMLElement> ) {
    this.setState( { anchorEl: event.currentTarget } );
  };

  private handleClose() {
    this.setState( { anchorEl: undefined } );
  };

  render() {
    const inlines = this._inlineStyles;
    const blocks = this._blockTypes;
    const activeBlock = blocks.find( block => block.type === this.props.activeBlockType ) || blocks[ 0 ];
    const activeStyle = this.props.activeStyle;

    return <Container className="mt-draft-toolbar">
      <ButtonGroup>
        <div
          id="mt-draft-blocks"
          onClick={e => this.handleClick( e )}
        >{activeBlock.label}
        </div>
        <Menu
          id="mt-draft-blocks-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean( this.state.anchorEl )}
          onClose={() => this.handleClose()}
        >
          {blocks.map( block => <MenuItem onClick={e => this.handleClose()}>{block.label}</MenuItem> )}
        </Menu>
      </ButtonGroup>

      <ButtonGroup>
        {inlines.map( inline => <div
          key={inline.label}
          style={{
            fontWeight: activeStyle.has( inline.type ) ? 'bold' : undefined
          }}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onInlineToggle( inline );
          }}
        >{inline.label}</div> )}
      </ButtonGroup>
    </Container>;
  }
}

const Container = styled.div`
  background: ${theme.light100.background };
  color: ${theme.light100.color };
`;

const ButtonGroup = styled.div`
  display: inline-block;
  margin: 0 10px 0 0;
  border: 1px solid ${theme.light100.border };
  border-radius: 4px;
  cursor: pointer;

  > div {
    padding: 5px;
    display: inline-block;
  }
`;