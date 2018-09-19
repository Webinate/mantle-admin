import * as React from 'react';
import { IComment, Page, IUserEntry } from 'modepress';
import Pager from 'modepress/clients/modepress-admin/src/components/pager';
import { default as styled } from 'modepress/clients/modepress-admin/src/theme/styled';
import { GetAllOptions } from 'modepress/src/lib-frontend/comments';
import Avatar from '@material-ui/core/Avatar';
import { generateAvatarPic } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';

export type Props = {
  page: Page<IComment<'client'>> | null;
  loading: boolean;
  getAll: ( options: Partial<GetAllOptions> ) => void;
  onCommentsSelected: ( uids: string[] ) => void;
};

export type State = {

};

export class CommentsList extends React.Component<Props, State> {
  private _container: HTMLElement | null;

  constructor( props: Props ) {
    super( props );
    this._container = null;
    this.state = {

    };
  }

  componentDidMount() {
    this.props.getAll( {
      index: 0
    } );
  }

  render() {
    const comments = this.props.page;

    if ( !comments || comments.data.length === 0 )
      return <div>No Comments</div>;

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
          {comments.data.map( comment => {
            return (
              <Comment className="mt-comment">
                <div className="mt-comment-avatar">
                  <Avatar src={generateAvatarPic( comment.user as IUserEntry<'client'> )} />
                </div>
                <div
                  className="mt-comment-text"
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              </Comment>
            );
          } )}
        </PostsInnerContent>
      </Pager>
    );
  }
}


const PostsInnerContent = styled.div`
`;

const Comment = styled.div`
  display: flex;
  margin: 0 0 4px 0;

  > div {
    flex: 1;
  }

  .mt-comment-avatar {
    max-width: 50px;
  }

  .mt-comment-text {
    background: ${theme.light100.background };
    border: 1px solid ${theme.light100.border };
    border-radius: 5px;
    padding: 10px;
    position: relative;
    box-sizing: border-box;
  }
`;
