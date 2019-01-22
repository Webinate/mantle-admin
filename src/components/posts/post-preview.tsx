import * as React from 'react';
import { default as styled } from '../../theme/styled';
import { IPost, IUserEntry } from 'mantle';
import Avatar from '@material-ui/core/Avatar';
import { generateAvatarPic } from '../../utils/component-utils';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as format from 'date-fns/format';
import theme from '../../theme/mui-theme';

export type Props = {
  post: IPost<'expanded'>;
  id?: string;
  loading: boolean;
  renderComments?: () => undefined | null | JSX.Element;
}

type State = {
  activeZone: string;
};

export default class PostPreview extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );

    this.state = {
      activeZone: ''
    }
  }

  render() {
    if ( this.props.loading )
      return <CircularProgress className="mt-loading" />

    const post = this.props.post;
    const draft = post.latestDraft;
    const zones = post.document.template.zones;

    return <Container id="mt-post-preview">
      <div className="mt-preview-headers">
        <div className="mt-preview-author-avatar">
          <Avatar src={generateAvatarPic( post.author as IUserEntry<'client'> )} />
        </div>
        <div>
          <h1 id="mt-preview-title">{post.title}</h1>
          <div id="mt-header-details">
            <span>Posted </span>
            {post.author ? <span>by <span id="mt-preview-author">{( post.author as IUserEntry<'client'> ).username}</span></span> : undefined}
            <span id="mt-preview-date">{format( new Date( post.lastUpdated ), '[at] H:m [on] MMMM Do YYYY' )}</span>
          </div>
        </div>
      </div>

      <div className="mt-preview-content">
        {zones.length > 1 ? zones.map( z => <div key={`zone-${ z }`}>
          <div className="mt-zone-header">
            <h2>{z}</h2>
            <div className="mt-content-divider" />
          </div>
          <div
            className="mt-preview-content-col"
            dangerouslySetInnerHTML={{ __html: draft ? draft.html[ z ] : '' }}
          />
        </div>
        ) :
          <div
            className="mt-preview-content-col"
            dangerouslySetInnerHTML={{ __html: draft ? draft.html[ zones[ 0 ] ] : '' }}
          />
        }
      </div>

      <div id="mt-preview-comments">
        {this.props.renderComments ? this.props.renderComments() : undefined}
      </div>
    </Container >
  }
}

const Container = styled.form`

  .mt-preview-content {
    background: ${theme.light100.background };
    border: 1px solid ${theme.light100.border };
    border-radius: 5px;
  }

  h1 {
    margin: 0 0 10px 0;
  }

  #mt-preview-author {
    font-weight: 400;
  }

  #mt-preview-comments {
    padding: 0 20px 20px 20px;
  }

  #mt-preview-date {
    color: ${theme.light200.softColor };
    font-size: 12px;
    font-style: italic;
  }

  #mt-header-details {
    margin: 0 0 20px 0;
  }

  .mt-preview-headers {
    display: flex;
    padding: 10px;
    margin: 10px 10px 0 10px;
    border-radius: 10px;

    > div {
      flex: 1;
      &:first-child {
        max-width: 50px;
      }
    }
  }

  .mt-preview-content {
    display: flex;
    margin: 10px 20px 0 20px;
    overflow: auto;

    h2 {
      margin: 0 0 10px 0;
      text-transform: uppercase;
    }

    > div {
      flex: 1;
      padding: 20px;
      box-sizing: border-box;
    }

    .mt-content-divider {
      border-bottom: 1px solid ${theme.light100.border };
      margin: 0 auto 10px auto;
    }

    img {
      max-width: 100%;
    }
  }

  #mt-header-details > span {
    margin: 0 5px 0 0;
  }
`;