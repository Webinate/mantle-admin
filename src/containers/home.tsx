import * as React from 'react';
import { useState, useEffect } from 'react';
import { IRootState } from '../store';
import { default as styled } from '../theme/styled';
import { push } from 'react-router-redux';
import { useSelector, useDispatch } from 'react-redux';
import homeActions from '../store/home/actions';
import { State as AppState } from '../store/app/reducer';
import { State as HomeState } from '../store/home/reducer';
import ContentHeader from '../components/content-header';
import { generateAvatarPic } from '../utils/component-utils';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ArrowForwardIcon from '@material-ui/icons/ChevronRight';
import { Post } from 'mantle';
import format from 'date-fns/format';
import { createPost } from '../store/posts/actions';
import { randomId } from '../utils/misc';

/**
 * The main application entry point
 */
const Home: React.FC<void> = () => {
  const [postExpanded, setPostExpanded] = useState(false);
  const [rexExcited, setRexExcited] = useState(false);
  const dispatch = useDispatch();
  const home = useSelector<IRootState, HomeState>((state) => state.home);
  const app = useSelector<IRootState, AppState>((state) => state.app);

  useEffect(() => {
    dispatch(homeActions.getHomeElements());
  }, []);

  const renderLatestPost = (post: Post) => {
    return (
      <Card className="mt-latest-post">
        <CardHeader
          className="mt-post-header"
          avatar={<Avatar className="mt-avatar" src={generateAvatarPic(post.author)} />}
          title={<span className="mt-post-header-title">{post.title || ''}</span>}
          subheader={
            <span>
              By <span className="mt-post-header-author">{post.author ? post.author.username : ''}</span> on{' '}
              <span className="mt-post-header-date">{format(new Date(post.createdOn), 'MMM do, yyyy')}</span>
            </span>
          }
        />
        {post && post.featuredImage ? (
          <CardMedia
            style={{
              height: 0,
              paddingTop: '56.25%',
            }}
            title={post.brief}
            image={post.featuredImage.publicURL}
          />
        ) : undefined}
        <CardActions disableSpacing>
          <IconButton className="mt-edit-latest" onClick={(e) => dispatch(push('/dashboard/posts/edit/' + post._id))}>
            <VisibilityIcon />
          </IconButton>
          <IconButton
            className="mt-post-expand-btn"
            onClick={(e) => setPostExpanded(!postExpanded)}
            aria-expanded={postExpanded}
            aria-label="Show more"
            style={{ marginLeft: 'auto' }}
          >
            {postExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </CardActions>
        <Collapse timeout={app.debugMode ? 0 : 'auto'} in={postExpanded} unmountOnExit>
          <CardContent className="mt-latest-post-content">
            {post.document.template.zones.map((zone) => (
              <div key={zone} className="mt-zone">
                <h2 className="mt-zone-header">{zone}</h2>
                <div
                  className="mt-zone-content"
                  dangerouslySetInnerHTML={{ __html: post.latestDraft ? post.latestDraft.html[zone] : '' }}
                />
              </div>
            ))}
          </CardContent>
        </Collapse>
      </Card>
    );
  };

  const renderPostList = () => {
    const posts = home.posts;

    return (
      <Card>
        <CardHeader title="Recent Posts" />
        <List>
          {posts.map((p) => {
            return (
              <ListItem key={p._id as string} className="mt-recent-post">
                <ListItemAvatar>
                  <Avatar alt={p.author ? p.author.username : 'Author'} src={generateAvatarPic(p.author)} />
                </ListItemAvatar>
                <ListItemText
                  primary={<span className="mt-recent-post-title">{p.title}</span>}
                  secondary={
                    <span>
                      By <span className="mt-recent-post-author">{p.author ? p.author.username : ''}</span> on{' '}
                      <span className="mt-recent-post-date">{format(new Date(p.createdOn), `MMM do, yyyy`)}</span>
                    </span>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    className="mt-edit-post-btn"
                    onClick={(e) => dispatch(push('/dashboard/posts/edit/' + p._id))}
                    aria-label="Delete"
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Card>
    );
  };

  const isBusy = home.busy;

  return (
    <Container className="mt-home-container">
      <ContentHeader title="Home" busy={isBusy} />
      <Content>
        <img style={{ visibility: rexExcited ? 'hidden' : 'visible', opacity: 1 }} src="../images/rex-bored.svg" />
        <img style={{ visibility: rexExcited ? 'visible' : 'hidden', opacity: 1 }} src="../images/rex-excited.svg" />
        <DashRow>
          {home.posts.length > 0 ? <div>{renderPostList()}</div> : <div />}
          <div>
            <div
              className="mt-card"
              onMouseEnter={(e) => setRexExcited(true)}
              onMouseLeave={(e) => setRexExcited(false)}
            >
              <Card>
                <CardHeader
                  action={
                    <Tooltip title="Create a new post">
                      <Fab
                        className="mt-create-post"
                        onClick={(e) => dispatch(createPost({ title: 'New Post', slug: randomId() }))}
                        size="small"
                        color="primary"
                      >
                        <AddIcon />
                      </Fab>
                    </Tooltip>
                  }
                  title="Add new post"
                />
              </Card>
            </div>

            {home.latestPost ? <div className="mt-card">{renderLatestPost(home.latestPost)}</div> : undefined}
          </div>
        </DashRow>
      </Content>
    </Container>
  );
};

export default Home;

const Container = styled.div`
  height: 100%;

  figure img {
    max-width: 100%;
  }
`;

const Content = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
  position: relative;

  > img {
    position: absolute;
    visibility: hidden;
    left: 10%;
    top: calc(100% - 260px);
    height: 200px;
    opacity: 0;
    transition: opacity 0.5s;
  }
`;

const DashRow = styled.div`
  display: flex;
  justify-content: space-between;

  .mt-card {
    margin: 0 0 10px 0;
  }

  > div {
    flex: 1;
    padding: 10px;
    overflow: hidden;
    position: relative;
  }
`;
