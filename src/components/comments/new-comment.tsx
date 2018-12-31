import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { IUserEntry } from 'modepress';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import { generateAvatarPic } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';

export type Props = {
  enabled: boolean;
  commentMode?: boolean;
  auth: IUserEntry<'client' | 'expanded'>;
  onNewComment: ( comment: string ) => void;
  onCancel?: () => void;
}

type State = {
  comment: string;
};

export default class NewComment extends React.Component<Props, State> {

  static defaultProps: Partial<Props> = {
    commentMode: false
  }

  constructor( props: Props ) {
    super( props );
    this.state = {
      comment: ''
    }
  }

  render() {
    return (
      <Container>
        <div>
          <Avatar src={generateAvatarPic( this.props.auth )} />
        </div>
        <div>
          <textarea
            placeholder="Write a comment"
            id={this.props.commentMode ? 'mt-reply-comment-content' : 'mt-new-comment-content'}
            value={this.state.comment}
            autoFocus={this.props.commentMode ? true : undefined}
            onClick={e => e.stopPropagation()}
            onChange={( e ) => {
              e.currentTarget.style.height = '1px';
              e.currentTarget.style.height = ( 20 + e.currentTarget.scrollHeight ) + 'px';
              this.setState( { comment: e.currentTarget.value } )
            }}
          />
          {
            this.props.commentMode ?
              <div className="mt-comment-form-actions">
                <span
                  id="mt-reply-comment-cancel-btn"
                  onClick={e => {
                    e.stopPropagation();
                    if ( this.props.onCancel )
                      this.props.onCancel()
                  }}
                >Cancel</span>
                <span
                  id="mt-reply-comment-add-btn"
                  onClick={e => {
                    if ( this.state.comment.trim() === '' )
                      return;

                    e.stopPropagation();
                    this.props.onNewComment( this.state.comment );
                    this.setState( { comment: '' } );
                  }}
                >Reply</span>
              </div> :
              <div className="mt-comment-form-actions">
                <IconButton
                  id="mt-new-comment-add-btn"
                  disabled={!this.props.enabled}
                  onClick={e => {
                    if ( this.state.comment.trim() === '' )
                      return;

                    this.props.onNewComment( this.state.comment );
                    this.setState( { comment: '' } );
                  }}
                  style={{ height: '40px', width: '40px' }}>
                  <CommentIcon style={{ fontSize: '18px' }} />
                </IconButton>
              </div>
          }

        </div>
      </Container>
    )
  }
}

const Container = styled.div`
  display: flex;
  padding: 20px 0 5px 0;

  > div {
    flex: 1;
    &:first-child {
      max-width: 60px;
    }
  }

  #mt-new-comment-cancel-btn, #mt-reply-comment-cancel-btn,
    #mt-new-comment-add-btn, #mt-reply-comment-add-btn {
    font-size: 12px;
    cursor: pointer;
    font-weight: 400;
    margin: 0 0 0 5px;
    line-height: 30px;
    color: ${theme.primary200.background };

    &:hover {
      color: ${theme.primary300.background };
    }
  }

  .mt-comment-form-actions {
    text-align: right;
  }

  textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid ${theme.light100.border };
    resize: none;
    font-weight: lighter;
    margin: 0 0 5px 0;

    &::placeholder {
      color: ${theme.light100.softColor };
    }

    &:active, &:focus {
      border: 1px solid ${theme.primary100.border };
      outline: none;
    }
  }
`;