import * as React from 'react';
import {
  Comment,
  User,
  UpdateCommentInput,
  AddCommentInput,
  PaginatedCommentsResponse,
  QueryCommentsArgs,
} from 'mantle';
import Pager from '../../components/pager';
import { default as styled } from '../../theme/styled';
import Avatar from '@material-ui/core/Avatar';
import { generateAvatarPic, isAdminUser } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';
import { format } from 'date-fns';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import NewComment from './new-comment';

export type Props = {
  page: PaginatedCommentsResponse | null;
  loading: boolean;
  selectable?: boolean;
  heightFromContents?: boolean;
  auth: User;
  style?: React.CSSProperties;
  selectedUids?: string[];
  onCommentSelected?: (comment: Comment) => void;
  getAll: (options: Partial<QueryCommentsArgs>) => void;
  onEdit: (token: Partial<UpdateCommentInput>) => void;
  onDelete: (id: string) => void;
  onReply: (post: string, parent: string, token: Partial<AddCommentInput>) => void;
};

export type State = {
  activeCommentId: string;
  activeCommentText: string;
  commentToDelete: null | Comment;
  commentToReplyId: string;
};

export class CommentsList extends React.Component<Props, State> {
  private _container: React.RefObject<HTMLDivElement> | null;

  static defaultProps: Partial<Props> = {
    heightFromContents: true,
    selectedUids: [],
    selectable: true,
  };

  constructor(props: Props) {
    super(props);
    this._container = React.createRef();
    this.state = {
      activeCommentId: '',
      activeCommentText: '',
      commentToDelete: null,
      commentToReplyId: '',
    };
  }

  componentDidMount() {
    this.props.getAll({
      index: 0,
      postId: undefined,
    });
  }

  private onEdit(comment: Comment) {
    this.setState({
      activeCommentId: comment._id as string,
      activeCommentText: comment.content,
      commentToReplyId: '',
    });
  }

  private renderConfirmDelete() {
    return (
      <Dialog open={true} onClose={(e) => this.setState({ commentToDelete: null })}>
        <DialogContent>
          <DialogContentText id="mt-comment-delete-msg">
            Are you sure you want to delete this comment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="mt-del-comment-cancel-btn" onClick={(e) => this.setState({ commentToDelete: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            id="mt-del-comment-confirm-btn"
            style={{ background: theme.error.background, color: theme.error.color }}
            onClick={(e) => {
              this.props.onDelete(this.state.commentToDelete!._id as string);
              this.setState({
                commentToDelete: null,
              });
            }}
            color="primary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  private flattenComments(comment: Comment, flat: Comment[]) {
    flat.push(comment);

    if (comment.children) {
      for (const child of comment.children) this.flattenComments(child as Comment, flat);
    }
  }

  render() {
    const comments = this.props.page;

    if (!comments) return null;

    const flattened: Comment[] = [];
    for (const comment of comments.data) this.flattenComments(comment, flattened);

    const auth = this.props.auth;
    const isAdmin = isAdminUser(auth);

    return (
      <Pager
        loading={this.props.loading}
        total={comments.count}
        limit={comments.limit}
        index={comments.index}
        heightFromContents={this.props.heightFromContents}
        footerBackground={false}
        onPage={(index) => {
          if (this._container && this._container.current) this._container.current.scrollTop = 0;

          this.props.getAll({ index: index });
        }}
      >
        <PostsInnerContent id="mt-comments" style={this.props.style} ref={this._container}>
          {this.props.loading ? (
            <div className="mt-loading" style={{ textAlign: 'center', padding: '0 0 20px 0' }}>
              <CircularProgress className="mt-loading" size={30} />
            </div>
          ) : undefined}

          {flattened.map((comment, index) => {
            const isEditting = this.state.activeCommentId === (comment._id as string);
            const isChild = comment.parentId ? true : false;
            const user = comment.user;
            let canEditComment = isAdmin || (user && user._id === auth._id ? true : false);
            const isSelected = this.props.selectedUids!.indexOf(comment._id as string) !== -1;

            return (
              <CommentDiv
                selectable={this.props.selectable!}
                className={`mt-comment ${isEditting ? 'mt-editting' : ''} ${isChild ? 'mt-is-child' : ''} ${
                  isSelected ? 'mt-comment-selected' : ''
                }`}
                key={'comment-' + index.toString()}
                onClick={() => {
                  if (this.props.onCommentSelected) {
                    this.setState({ commentToReplyId: '', activeCommentId: '' });
                    this.props.onCommentSelected(comment);
                  }
                }}
              >
                <div className="mt-comment-avatar">
                  <Avatar src={generateAvatarPic(user || null)} />
                </div>
                <div>
                  <div className="mt-comment-author">{comment.author}</div>
                  {!isEditting ? (
                    <div className="mt-comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                  ) : (
                    <textarea
                      id="mt-comment-edit-txt"
                      autoFocus={true}
                      ref={(elm) => {
                        if (!elm) return;

                        elm.style.height = '1px';
                        elm.style.height = 20 + elm.scrollHeight + 'px';
                      }}
                      onChange={(e) => {
                        e.currentTarget.style.height = '1px';
                        e.currentTarget.style.height = 20 + e.currentTarget.scrollHeight + 'px';
                        this.setState({ activeCommentText: e.currentTarget.value });
                      }}
                      value={this.state.activeCommentText}
                    />
                  )}
                  {isEditting ? (
                    <div className="mt-edit-conf-panel">
                      <span
                        id="mt-edit-comment-cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.setState({ activeCommentId: '' });
                        }}
                      >
                        Cancel
                      </span>
                      <span
                        id="mt-edit-comment-save"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (this.state.activeCommentText.trim() === '') return;

                          this.props.onEdit({ content: this.state.activeCommentText, _id: this.state.activeCommentId });
                          this.setState({ activeCommentId: '' });
                        }}
                      >
                        Save
                      </span>
                    </div>
                  ) : (
                    <div className={`mt-comment-editpnl`}>
                      {canEditComment ? (
                        <span
                          className="mt-edit-comment-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.onEdit(comment);
                          }}
                        >
                          Edit
                        </span>
                      ) : undefined}
                      {canEditComment ? (
                        <span
                          className="mt-del-comment-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.setState({ commentToDelete: comment });
                          }}
                        >
                          Delete
                        </span>
                      ) : undefined}
                      <span
                        className="mt-reply-comment-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          this.setState({
                            commentToReplyId: comment._id as string,
                            activeCommentId: '',
                          });
                        }}
                      >
                        Reply
                      </span>
                      <span className="mt-comment-date">
                        {format(new Date(comment.lastUpdated), `MMMM do yyyy 'at' H:m`)}
                      </span>
                    </div>
                  )}
                  {(comment._id as string) === this.state.commentToReplyId ? (
                    <NewComment
                      auth={this.props.auth}
                      enabled={true}
                      commentMode={true}
                      onNewComment={(text) => {
                        this.props.onReply(comment.postId, comment._id, {
                          content: text,
                          post: comment.postId,
                          parent: this.state.commentToReplyId || undefined,
                        });
                        this.setState({ commentToReplyId: '' });
                      }}
                      onCancel={() => this.setState({ commentToReplyId: '' })}
                    />
                  ) : undefined}
                </div>
              </CommentDiv>
            );
          })}
        </PostsInnerContent>

        {this.state.commentToDelete ? this.renderConfirmDelete() : undefined}
      </Pager>
    );
  }
}

interface CommentStyleProps extends React.HTMLAttributes<HTMLElement> {
  selectable: boolean;
}

const PostsInnerContent = styled.div``;

const CommentDiv = styled.div`
  display: flex;
  margin: 0 0 16px 0;
  padding: 4px 8px 4px 4px;
  border-radius: 5px;
  color: ${theme.light100.color};

  ${(props: CommentStyleProps) =>
    props.selectable
      ? `
    cursor: pointer;

    &:hover, &.mt-comment-selected {
      background: ${theme.light100.background};
      color: ${theme.light100.color};
    }
  `
      : ''}

  > div {
    flex: 1;
  }

  &.mt-is-child {
    margin-left: 30px;
  }

  .mt-comment-editpnl {
    margin: 2px 0 0 0;
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

  .mt-edit-comment-btn,
  .mt-del-comment-btn,
  .mt-reply-comment-btn,
  #mt-edit-comment-save,
  #mt-edit-comment-cancel {
    font-size: 12px;
    cursor: pointer;
    font-weight: 400;
    color: ${theme.primary200.background};
    &:hover {
      color: ${theme.primary300.background};
    }
  }

  .mt-edit-comment-btn,
  .mt-del-comment-btn,
  .mt-reply-comment-btn {
    margin: 0 5px 0 0;
  }

  textarea {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid ${theme.light100.border};
    resize: none;
    font-weight: lighter;
    margin: 2px 0 0 0;

    &::placeholder {
      color: ${theme.light100.softColor};
    }

    &:active,
    &:focus {
      border: 1px solid ${theme.primary100.border};
      outline: none;
    }
  }

  .mt-comment-date {
    color: ${theme.light200.softColor};
    font-size: 12px;
  }
`;
