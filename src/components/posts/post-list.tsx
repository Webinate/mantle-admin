import * as React from 'react';
import { IconButton, Avatar } from 'material-ui';
import { Pager } from '../../components/pager';
import { Page, IPost } from 'modepress';
import * as moment from 'moment';
import { default as styled } from '../../theme/styled';
import { generateAvatarPic } from '../../utils/component-utils';
import theme from '../../theme/mui-theme';

export type Props = {
  posts: Page<IPost> | null;
  getPosts: ( index: number ) => void;
  onPostSelected: ( post: IPost[] ) => void
  onEdit: ( post: IPost ) => void;
  onDelete: ( post: IPost ) => void;
  selected: IPost[];
}

export type State = {
}

export class PostList extends React.Component<Props, State> {
  constructor( props: Props ) {
    super( props );
    this.state = {
    };
  }

  componentDidMount() {
    this.props.getPosts( 0 );
  }

  private onPostSelected( post: IPost, e: React.MouseEvent<HTMLDivElement> ) {
    e.preventDefault();
    e.stopPropagation();

    if ( !e.ctrlKey && !e.shiftKey ) {
      this.props.onPostSelected( [ post ] );

    }
    else if ( e.ctrlKey ) {
      if ( this.props.selected.indexOf( post ) === -1 )
        this.props.onPostSelected( this.props.selected.concat( post ) );
      else
        this.props.onPostSelected( this.props.selected.filter( i => i !== post ) );
    }
    else {
      const postPage = this.props.posts!;
      const selected = this.props.selected;

      let firstIndex = Math.min( postPage.data.indexOf( post ), selected.length > 0 ? postPage.data.indexOf( selected[ 0 ] ) : 0 );
      let lastIndex = Math.max( postPage.data.indexOf( post ), selected.length > 0 ? postPage.data.indexOf( selected[ 0 ] ) : 0 );

      this.props.onPostSelected( postPage.data.slice( firstIndex, lastIndex + 1 ) );
    }
  }

  render() {
    const posts = this.props.posts;

    return <div>
      {posts ? <Pager
        total={posts!.count}
        limit={posts!.limit}
        offset={posts!.index}
        onPage={index => this.props.getPosts( index )}
      >
        <PostsInnerContent className="mt-posts">
          {posts.data.map( ( post, postIndex ) => {
            const selected = this.props.selected.indexOf( post ) === -1 ? false : true;
            return <Post
              key={'post-' + postIndex}
              selected={selected}
              className="mt-post"
              onClick={e => { this.onPostSelected( post, e ) }}
            >
              <IconButton
                style={{ top: 0, right: '30px', position: 'absolute' }}
                iconStyle={{ color: theme.primary200.background }}
                className="mt-post-button"
                iconClassName="icon icon-edit"
                onClick={e => this.props.onEdit( post )}
              />
              <IconButton
                style={{ top: 0, right: 0, position: 'absolute' }}
                iconStyle={{ color: theme.primary200.background }}
                className="mt-post-button"
                iconClassName="icon icon-delete"
                onClick={e => this.props.onDelete( post )}
              />
              <div className="mt-post-featured-thumb">{post.featuredImage ? <img src={post.featuredImage} /> : <img src={'/images/post-feature.svg'} />}</div>
              <div className="mt-post-dates">
                <i>{moment( post.lastUpdated ).format( 'MMM Do, YYYY' )}</i>
                <i>{moment( post.createdOn ).format( 'MMM Do, YYYY' )}</i>
              </div>
              <div className="mt-post-info">
                <Avatar
                  src={generateAvatarPic( post.author ? post.author.avatar : '' )}
                  size={60}
                  style={{ float: 'right' }}
                />
                <h3 className="mt-post-name">{post.title || 'UNTITLED'}</h3>
              </div>
            </Post>
          } )}
        </PostsInnerContent>
      </Pager> : undefined}
    </div>
  }
}

interface PostProps extends React.HTMLProps<HTMLDivElement> {
}

const PostsInnerContent = styled.div`
  height: 100%;
`;

const Post = styled.div`
  margin: 10px;
  float: left;
  padding: 5px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.25s background;
  width: 300px;
  height: 300px;
  background: ${( props: PostProps ) => props.selected ? theme.primary200.background : theme.light300.background };
  color: ${( props: PostProps ) => props.selected ? theme.primary200.color : '' };
  user-select: none;
  position: relative;

  &:hover {
    background: ${( props: PostProps ) => props.selected ? '' : theme.light400.background };
    color: ${( props: PostProps ) => props.selected ? '' : theme.light400.color };

    .mt-post-button {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mt-post-info {
    clear: both;
    > h3 {
      display: inline-block;
    }
  }

  .mt-post-dates {
    padding: 5px 0 0 0;
    border-top: 1px solid #ccc;

    i:first-child { float: left; }
    i:last-child { float: right; }
  }

  &:active {
    background: ${( props: PostProps ) => props.selected ? '' : theme.light100.background };
    color: ${( props: PostProps ) => props.selected ? '' : theme.light100.color };
  }

  .mt-post-button {
    opacity: 0;
    transform: translateY(-15px);
  }

  .mt-post-featured-thumb {
    height: 200px;
    background: ${( props: PostProps ) => props.selected ? theme.light100.background : theme.light100.background };
    color: ${( props: PostProps ) => props.selected ? theme.light100.color : '' };
    text-align: center;
  }

  .mt-post-featured-thumb img {
    height: 100%;
  }

  h3 {
    padding: 5px 0 0 0;
    clear: both;
  }
`;