import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { default as theme } from '../../theme/mui-theme';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Icon from '@material-ui/core/Icon';
import { DraftElements } from '../../../../../src';

type Props = {
  onCreateBlock: (type: DraftElements, html: string) => void;
  onInlineToggle: (type: InlineType) => void;
  onAddMedia: () => void;
  onDelete: () => void;
  onLink: () => void;
  animate?: boolean;
  style: React.CSSProperties;
};

type State = {
  anchorEl: HTMLElement | undefined;
  activeInlines: InlineType[];
};

export type Blocks = {
  label: string | JSX.Element;
  type: DraftElements;
  html: string;
};

export type InlineType = 'bold' | 'italic' | 'underline';

export type Inline = {
  label: string | JSX.Element;
  type: InlineType;
};

/**
 * An html component that represents the entire html page to be rendered
 */
export default class EditorToolbar extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    animate: false
  };
  private _regularBlocks: Blocks[];
  private _listBlocks: Blocks[];
  private _inlineStyles: Inline[];
  private _iconStyles: React.CSSProperties;
  private _onSelectionChange: any;

  constructor(props: Props) {
    super(props);

    this._iconStyles = { fontSize: '18px' };

    this._regularBlocks = [
      { label: 'Header 1', type: 'elm-header-1', html: '<h1></h1>' },
      { label: 'Header 2', type: 'elm-header-2', html: '<h2></h2>' },
      { label: 'Header 3', type: 'elm-header-3', html: '<h3></h3>' },
      { label: 'Header 4', type: 'elm-header-4', html: '<h4></h4>' },
      { label: 'Header 5', type: 'elm-header-5', html: '<h5></h5>' },
      { label: 'Header 6', type: 'elm-header-6', html: '<h6></h6>' },
      { label: 'Code Block', type: 'elm-code', html: '<pre></pre>' },
      { label: 'Paragraph', type: 'elm-paragraph', html: '<p></p>' }
    ];

    this._listBlocks = [
      {
        label: (
          <Icon style={this._iconStyles}>
            <i className="icon icon-editor-ul" />
          </Icon>
        ),
        type: 'elm-list',
        html: '<ul><li></li></ul>'
      },
      {
        label: (
          <Icon style={this._iconStyles}>
            <i className="icon icon-editor-ol" />
          </Icon>
        ),
        type: 'elm-list',
        html: '<ol><li></li></ol>'
      }
    ];

    this._inlineStyles = [
      {
        label: (
          <Icon style={this._iconStyles}>
            <i className="icon icon-editor-bold" />
          </Icon>
        ),
        type: 'bold'
      },
      {
        label: (
          <Icon style={this._iconStyles}>
            <i className="icon icon-editor-italic" />
          </Icon>
        ),
        type: 'italic'
      },
      {
        label: (
          <Icon style={this._iconStyles}>
            <i className="icon icon-editor-underline" />
          </Icon>
        ),
        type: 'underline'
      }
    ];

    this._onSelectionChange = this.onSelectionChange.bind(this);

    this.state = {
      anchorEl: undefined,
      activeInlines: []
    };
  }

  onSelectionChange(e: Event) {
    const inlines = this._inlineStyles;
    const activeInlines: InlineType[] = [];

    for (const inline of inlines) if (document.queryCommandState(inline.type)) activeInlines.push(inline.type);

    this.setState({ activeInlines });
  }

  componentDidMount() {
    document.addEventListener('selectionchange', this._onSelectionChange);
  }

  componentWillUnmount() {
    document.removeEventListener('selectionchange', this._onSelectionChange);
  }

  render() {
    const iconStyle = this._iconStyles;
    const inlines = this._inlineStyles;
    const pBlock: Blocks = {
      label: (
        <Icon style={iconStyle}>
          <i className="icon icon-editor-para" />
        </Icon>
      ),
      type: 'elm-paragraph',
      html: '<p></p>'
    };
    const listBlocks = this._listBlocks;
    const blocks = this._regularBlocks;
    const activeInlines = this.state.activeInlines;

    return (
      <div style={this.props.style} className="mt-draft-toolbar">
        <ButtonGroup>
          <div id="mt-draft-blocks" onClick={e => this.setState({ anchorEl: e.currentTarget })}>
            Insert
          </div>
          <Menu
            id="mt-draft-blocks-menu"
            transitionDuration={this.props.animate ? undefined : 0}
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={() => this.setState({ anchorEl: undefined })}
          >
            {blocks.map((block, index) => (
              <MenuItem
                key={`bocks-${index}`}
                id={`mt-create-${block.type}`}
                onClick={e => {
                  this.props.onCreateBlock(block.type, block.html);
                  this.setState({ anchorEl: undefined });
                }}
              >
                {block.label}
              </MenuItem>
            ))}
          </Menu>
        </ButtonGroup>

        <ButtonGroup>
          {inlines.map((inline, index) => (
            <div
              className={`mt-inline-btn ${activeInlines.includes(inline.type) ? 'active' : ''}`}
              id={`mt-inline-${inline.type}`}
              key={`elm-inline-${index}`}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                this.props.onInlineToggle(inline.type);
              }}
            >
              {inline.label}
            </div>
          ))}
        </ButtonGroup>

        <ButtonGroup>
          {listBlocks.map((listBlock, index) => (
            <div
              id={`mt-create-${listBlock.type}-${index}`}
              key={`elm-lists-${index}`}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                this.props.onCreateBlock(listBlock.type, listBlock.html);
              }}
            >
              {listBlock.label}
            </div>
          ))}
        </ButtonGroup>

        <ButtonGroup>
          <div
            id="mt-create-paragraph"
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onCreateBlock(pBlock.type, pBlock.html);
            }}
          >
            {pBlock.label}
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div
            id="mt-create-media"
            onClick={e => {
              this.props.onAddMedia();
            }}
          >
            <Icon style={iconStyle}>
              <i className="icon icon-editor-img" />
            </Icon>
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div
            id="mt-create-link"
            onMouseDown={e => {
              this.props.onLink();
            }}
          >
            <Icon style={iconStyle}>
              <i className="icon icon-editor-link" />
            </Icon>
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div
            id="mt-create-html"
            onClick={e => {
              this.props.onCreateBlock('elm-html', '<div></div>');
            }}
          >
            <Icon style={iconStyle}>
              <i className="icon icon-editor-html" />
            </Icon>
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div
            id="mt-delete-elms"
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              this.props.onDelete();
            }}
          >
            <Icon style={iconStyle}>
              <i className="icon icon-editor-trash" />
            </Icon>
          </div>
        </ButtonGroup>
      </div>
    );
  }
}

const ButtonGroup = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin: 0 10px 0 0;
  border-radius: 4px;
  cursor: pointer;

  > div {
    &:hover,
    &.active {
      background: ${theme.light200.background};
    }

    padding: 4px;
    display: inline-block;
  }
`;
