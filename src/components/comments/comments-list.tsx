import * as React from 'react';
import { IComment, Page } from 'modepress';
import Pager from 'modepress/clients/modepress-admin/src/components/pager';
import { default as styled } from 'modepress/clients/modepress-admin/src/theme/styled';
import { GetAllOptions } from 'modepress/src/lib-frontend/comments';

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
        </PostsInnerContent>
      </Pager>
    );
  }
}

const PostsInnerContent = styled.div`
  height: 100%;
  overflow: auto;
`;