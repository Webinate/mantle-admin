import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import { DraftBlockType, DraftInlineStyle } from 'draft-js';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Icon from '@material-ui/core/Icon';

type Props = {
  onCreateBlock: ( type: BlockType ) => void;
  onInlineToggle: ( type: InlineType ) => void;
  onAddMedia: () => void;
  activeBlockType: DraftBlockType;
  activeStyle: DraftInlineStyle;
  animate?: boolean;
}

type State = {
  anchorEl: HTMLElement | undefined;
};

export type BlockType = {
  label: string | JSX.Element;
  type: DraftBlockType
}

export type InlineType = {
  label: string | JSX.Element;
  type: 'BOLD' | 'ITALIC' | 'UNDERLINE'
}

/**
 * An html component that represents the entire html page to be rendered
 */
export default class DraftToolbar extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    animate: false
  }
  private _regularBlocks: BlockType[];
  private _listBlocks: BlockType[];
  private _inlineStyles: InlineType[];
  private _lastSelectedBlock: BlockType | null;
  private _iconStyles: React.CSSProperties;

  constructor( props: Props ) {
    super( props );

    this._iconStyles = { fontSize: '16px' };

    this._regularBlocks = [
      { label: 'Header 1', type: 'header-one' },
      { label: 'Header 2', type: 'header-two' },
      { label: 'Header 3', type: 'header-three' },
      { label: 'Header 4', type: 'header-four' },
      { label: 'Header 5', type: 'header-five' },
      { label: 'Header 6', type: 'header-six' },
      { label: 'Blockquote', type: 'blockquote' },
      { label: 'Code Block', type: 'code-block' },
      { label: 'Paragraph', type: 'paragraph' }
    ];

    this._listBlocks = [
      { label: <Icon style={this._iconStyles}><i className="icon icon-editor-ul" /></Icon>, type: 'unordered-list-item' },
      { label: <Icon style={this._iconStyles}><i className="icon icon-editor-ol" /></Icon>, type: 'ordered-list-item' }
    ];

    this._inlineStyles = [
      { label: <Icon style={this._iconStyles}><i className="icon icon-editor-bold" /></Icon>, type: 'BOLD' },
      { label: <Icon style={this._iconStyles}><i className="icon icon-editor-italic" /></Icon>, type: 'ITALIC' },
      { label: <Icon style={this._iconStyles}><i className="icon icon-editor-underline" /></Icon>, type: 'UNDERLINE' }
    ];

    this.state = {
      anchorEl: undefined
    };
  }

  render() {
    const iconStyle = this._iconStyles;
    const inlines = this._inlineStyles;
    const pBlock: BlockType = {
      label: (
        <Icon style={iconStyle}>
          <i className="icon icon-editor-para" />
        </Icon>
      ), type: 'paragraph'
    };
    const listBlocks = this._listBlocks;
    const blocks = this._regularBlocks;
    const activeBlock = blocks.find( block => block.type === this.props.activeBlockType ) || blocks[ 0 ];
    const activeStyle = this.props.activeStyle;

    return <div className="mt-draft-toolbar">
      <ButtonGroup>
        <div
          id="mt-draft-blocks"
          onClick={e => this.setState( { anchorEl: e.currentTarget } )}
        >{activeBlock.label}
        </div>
        <Menu
          id="mt-draft-blocks-menu"

          onTransitionEnd={e => {
            if ( this._lastSelectedBlock )
              this.props.onCreateBlock( this._lastSelectedBlock );

            this._lastSelectedBlock = null;
          }}
          anchorEl={this.state.anchorEl}
          open={Boolean( this.state.anchorEl )}
          onClose={() => this.setState( { anchorEl: undefined } )}
        >
          {blocks.map( block => (
            <MenuItem
              key={block.type}
              onClick={e => {
                this._lastSelectedBlock = block;
                this.setState( { anchorEl: undefined } );
              }}
            >
              {block.label}
            </MenuItem>
          )
          )}
        </Menu>
      </ButtonGroup>

      <ButtonGroup>
        {inlines.map( inline => <div
          key={inline.type}
          className={`${ activeStyle.has( inline.type ) ? 'active' : '' }`}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onInlineToggle( inline );
          }}
        >{inline.label}</div> )}
      </ButtonGroup>

      <ButtonGroup>
        {listBlocks.map( listBlock => <div
          key={listBlock.type}
          className={`${ activeStyle.has( listBlock.type ) ? 'active' : '' }`}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            this.props.onCreateBlock( listBlock );
          }}
        >{listBlock.label}</div> )}
      </ButtonGroup>

      <ButtonGroup>
        <div
          className={`${ activeStyle.has( pBlock.type ) ? 'active' : '' }`}
          onClick={e => {
            this.props.onCreateBlock( pBlock );
          }}
        >{pBlock.label}
        </div>
      </ButtonGroup>

      <ButtonGroup>
        <div onClick={e => {
          this.props.onAddMedia();
        }}
        >
          <Icon style={iconStyle}>
            <i className="icon icon-editor-img" />
          </Icon>
        </div>
      </ButtonGroup>

      <ButtonGroup>
        <div onClick={e => {
          this.props.onAddMedia();
        }}
        >
          <Icon style={iconStyle}>
            <i className="icon icon-editor-link" />
          </Icon>
        </div>
      </ButtonGroup>

      <ButtonGroup>
        <div onClick={e => {
          this.props.onAddMedia();
        }}
        >
          <Icon style={iconStyle}>
            <i className="icon icon-editor-html" />
          </Icon>
        </div>
      </ButtonGroup>
    </div>;
  }
}

const ButtonGroup = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin: 0 10px 0 0;
  border-radius: 4px;
  cursor: pointer;

  > div {
    &:hover, &.active {
      background: ${theme.light200.background };
    }

    padding: 5px;
    display: inline-block;
  }
`;