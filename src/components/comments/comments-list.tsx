import * as React from 'react';
import { IComment, Page, IUserEntry, CommentGetAllOptions, IPost } from 'modepress';
import Pager from 'modepress/clients/modepress-admin/src/components/pager';
import { default as styled } from 'modepress/clients/modepress-admin/src/theme/styled';
import Avatar from '@material-ui/core/Avatar';
import { generateAvatarPic } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';
import * as format from 'date-fns/format';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import NewComment from './new-comment';

export type Props = {
  page: Page<IComment<'client'>> | null;
  loading: boolean;
  auth: IUserEntry<'client'>;
  getAll: ( options: Partial<CommentGetAllOptions> ) => void;
  onCommentsSelected: ( uids: string[] ) => void;
  onEdit: ( id: string, token: Partial<IComment<'client'>> ) => void;
  onDelete: ( id: string ) => void;
  onReply: ( post: string, parent: string, token: Partial<IComment<'client'>> ) => void;
};

export type State = {
  activeCommentId: string;
  activeCommentText: string;
  commentToDelete: null | IComment<'client'>;
  commentToReplyId: string;
};

export class CommentsList extends React.Component<Props, State> {
  private _container: HTMLElement | null;

  constructor( props: Props ) {
    super( props );
    this._container = null;
    this.state = {
      activeCommentId: '',
      activeCommentText: '',
      commentToDelete: null,
      commentToReplyId: ''
    };
  }

  componentDidMount() {
    this.props.getAll( {
      index: 0,
      depth: -1,
      expanded: true
    } );
  }

  private onEdit( comment: IComment<'client'> ) {
    this.setState( {
      activeCommentId: comment._id,
      activeCommentText: comment.content,
      commentToReplyId: ''
    } );
  }

  private renderConfirmDelete() {
    return (
      <Dialog
        open={true}
        onClose={e => this.setState( { commentToDelete: null } )}
      >
        <DialogContent>
          <DialogContentText id="mt-comment-delete-msg">
            Are you sure you want to delete this comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            id="mt-del-comment-cancel-btn"
            onClick={e => this.setState( { commentToDelete: null } )}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            id="mt-del-comment-confirm-btn"
            style={{ background: theme.error.background, color: theme.error.color }}
            onClick={e => {
              this.props.onDelete( this.state.commentToDelete!._id );
              this.setState( {
                commentToDelete: null
              } );
            }}
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private flattenComments( comment: IComment<'client'>, flat: IComment<'client'>[] ) {
    flat.push( comment );

    for ( const child of comment.children )
      this.flattenComments( child as IComment<'client'>, flat );
  }

  render() {
    const comments = this.props.page;

    // if ( this.props.loading )
    //   return (
    //     <div className="mt-loading" style={{ textAlign: 'center', padding: '0 0 20px 0' }} >
    //       <CircularProgress size={30} />
    //     </div>
    //   );

    if ( !comments )
      return null;

    const flattened: IComment<'client'>[] = [];
    for ( const comment of comments.data )
      this.flattenComments( comment, flattened );

    return (
      <Pager
        loading={this.props.loading}
        total={comments.count}
        limit={comments.limit}
        index={comments.index}
        heightFromContents={true}
        footerBackground={false}
        onPage={index => {
          if ( this._container )
            this._container.scrollTop = 0;

          this.props.getAll( { index: index } )
        }}
        contentProps={{
          onMouseDown: e => this.props.onCommentsSelected( [] )
        }}
      >
        <PostsInnerContent
          id="mt-comments"
          innerRef={elm => this._container = elm}
        >
          {this.props.loading ? <div className="mt-loading" style={{ textAlign: 'center', padding: '0 0 20px 0' }} >
            <CircularProgress size={30} />
          </div> : undefined}

          {flattened.map( ( comment, index ) => {
            const isEditting = this.state.activeCommentId === comment._id;
            const isChild = comment.parent ? true : false;

            return (
              <Comment
                className={`mt-comment ${ isEditting ? 'mt-editting' : '' } ${ isChild ? 'mt-is-child' : '' }`}
                key={'comment-' + index.toString()}
              >
                <div className="mt-comment-avatar">
                  <Avatar src={generateAvatarPic( comment.user as IUserEntry<'client'> )} />
                </div>
                <div>
                  <div className="mt-comment-author">{comment.author}</div>
                  {
                    !isEditting ?
                      <div
                        className="mt-comment-text"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      /> :
                      <textarea
                        id="mt-comment-edit-txt"
                        autoFocus={true}
                        ref={elm => {
                          if ( !elm )
                            return;

                          elm.style.height = '1px';
                          elm.style.height = ( 20 + elm.scrollHeight ) + 'px';
                        }}
                        onChange={e => {
                          e.currentTarget.style.height = '1px';
                          e.currentTarget.style.height = ( 20 + e.currentTarget.scrollHeight ) + 'px';
                          this.setState( { activeCommentText: e.currentTarget.value } )
                        }}
                        value={this.state.activeCommentText}
                      />
                  }
                  {
                    isEditting ?
                      <div
                        className="mt-edit-conf-panel"
                      >
                        <span
                          id="mt-edit-comment-cancel"
                          onClick={e => this.setState( { activeCommentId: '' } )}
                        >
                          Cancel
                        </span>
                        <span
                          id="mt-edit-comment-save"
                          onClick={e => {
                            if ( this.state.activeCommentText.trim() === '' )
                              return;

                            this.props.onEdit( comment._id, { content: this.state.activeCommentText } );
                            this.setState( { activeCommentId: '' } );
                          }}
                        >
                          Save
                        </span>
                      </div> :
                      <div
                        className="mt-comment-editpnl">
                        <span
                          className="mt-edit-comment-btn"
                          onClick={e => this.onEdit( comment )}
                        >
                          Edit
                        </span>
                        <span
                          className="mt-del-comment-btn"
                          onClick={e => this.setState( { commentToDelete: comment } )}
                        >
                          Delete
                        </span>
                        <span
                          className="mt-reply-comment-btn"
                          onClick={e => this.setState( {
                            commentToReplyId: comment._id,
                            activeCommentId: ''
                          } )}
                        >
                          Reply
                        </span>
                        <span className="mt-comment-date">
                          {format( new Date( comment.lastUpdated ), 'MMMM Do YYYY [at] H:m' )}
                        </span>
                      </div>
                  }
                  {comment._id === this.state.commentToReplyId ?
                    <NewComment
                      auth={this.props.auth}
                      enabled={true}
                      commentMode={true}
                      onNewComment={text => {
                        this.props.onReply( ( comment.post as IPost<'client'> )._id, comment._id, {
                          content: text
                        } );
                        this.setState( { commentToReplyId: '' } );
                      }}
                      onCancel={() => this.setState( { commentToReplyId: '' } )}
                    /> : undefined
                  }
                </div>

              </Comment>
            );
          } )}
        </PostsInnerContent>
        {this.state.commentToDelete ? this.renderConfirmDelete() : undefined}
      </Pager>
    );
  }
}


const PostsInnerContent = styled.div`
`;

const Comment = styled.div`
  display: flex;
  margin: 0 0 8px 0;
  color: ${theme.light100.color };

  > div {
    flex: 1;
  }

  &.mt-is-child {
    margin-left: 30px;
  }

  .mt-comment-editpnl {
    margin: 6px 0 0 0;
  }

  &.mt-editting {
    margin: 20px 0 0 0;
    transition: 0.3s margin;
  }

  .mt-edit-conf-panel {
    text-align: right;
    margin: 6px 0 6px 0;
  }

  .mt-comment-avatar {
    max-width: 50px;
  }

  .mt-comment-author {
    font-size: 12px;
    font-weight: bold;
  }

  #mt-edit-comment-save {
    margin: 0 0 0 10px;
  }

  .mt-edit-comment-btn, .mt-del-comment-btn, .mt-reply-comment-btn, #mt-edit-comment-save, #mt-edit-comment-cancel {
    font-size: 12px;
    cursor: pointer;
    font-weight: 400;
    color: ${theme.primary200.background };
    &:hover {
      color: ${theme.primary300.background };
    }
  }

  .mt-edit-comment-btn, .mt-del-comment-btn, .mt-reply-comment-btn {
    margin: 0 5px 0 0;
  }

  textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid ${theme.light100.border };
    resize: none;
    font-weight: lighter;
    margin: 2px 0 0 0;

    &::placeholder {
      color: ${theme.light100.softColor };
    }

    &:active, &:focus {
      border: 1px solid ${theme.primary100.border };
      outline: none;
    }
  }

  .mt-comment-date {
    color: ${theme.light200.softColor };
    font-size: 12px;
  }
`;