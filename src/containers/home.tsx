import * as React from 'react';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { default as styled } from '../theme/styled';
import { push } from 'react-router-redux';
import { getHomeElements } from '../store/home/actions';
import ContentHeader from '../components/content-header';
// import theme from '../theme/mui-theme';
import { generateAvatarPic } from '../utils/component-utils';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
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
import { IPost } from '../../../../src';
import * as format from 'date-fns/format';
import { createPost } from '../store/posts/actions';
import { randomId } from '../utils/misc';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  user: state.authentication.user,
  home: state.home,
  app: state.app,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  push: push,
  getHomeElements,
  createPost
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  postExpanded: boolean;
  rexExcited: boolean;
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Home extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      postExpanded: false,
      rexExcited: false
    };
  }

  componentDidMount() {
    this.props.getHomeElements();
  }

  private renderLatestPost( post: IPost<'expanded'> ) {
    return (
      <Card>
        <CardHeader
          avatar={<Avatar src={generateAvatarPic( post.author )} />}
          title={post.title || ''}
          subheader={format( new Date( post.createdOn ), 'MMM Do, YYYY' )}
        />
        {post && post.featuredImage ? <CardMedia
          style={{
            height: 0,
            paddingTop: '56.25%'
          }}
          title={post.brief}
          image={post.featuredImage.publicURL}
        /> : undefined}
        <CardActions disableActionSpacing>
          <IconButton
            onClick={e => this.props.push( '/dashboard/posts/edit/' + post._id )}
            aria-label="Share"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            onClick={e => this.setState( { postExpanded: !this.state.postExpanded } )}
            aria-expanded={this.state.postExpanded}
            aria-label="Show more"
            style={{ marginLeft: 'auto' }}
          >
            {this.state.postExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </CardActions>
        <Collapse in={this.state.postExpanded} timeout="auto" unmountOnExit>
          <CardContent>
            {post.document.template.zones.map( zone => <div key={zone}>
              <h2>{zone}</h2>
              <div dangerouslySetInnerHTML={{ __html: post.latestDraft ? post.latestDraft.html[ zone ] : '' }} />
            </div>
            )}
          </CardContent>
        </Collapse>
      </Card>
    );
  }

  private renderPostList() {
    const posts = this.props.home.posts;

    return <Card>
      <CardHeader title="Recent Posts" />
      <List>
        {posts.map( p => {
          return (
            <ListItem
              key={p._id}
              button
            >
              <ListItemAvatar>
                <Avatar alt={p.author ? p.author.username : 'Author'} src={generateAvatarPic( p.author )} />
              </ListItemAvatar>
              <ListItemText
                primary={p.title}
                secondary={
                  <React.Fragment>
                    {p.brief}
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={e => this.props.push( '/dashboard/posts/edit/' + p._id )}
                  aria-label="Delete"
                >
                  <ArrowForwardIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        } )}
      </List>
    </Card>;
  }

  render() {
    const home = this.props.home;
    const isBusy = home.busy;

    return <Container>
      <ContentHeader
        title="Home"
        busy={isBusy}
      >
      </ContentHeader>
      <Content>
        <img
          style={{ visibility: this.state.rexExcited ? 'hidden' : 'visible', opacity: 1 }}
          src="../images/rex-bored.svg"
        />
        <img
          style={{ visibility: this.state.rexExcited ? 'visible' : 'hidden', opacity: 1 }}
          src="../images/rex-excited.svg"
        />
        <DashRow>
          {
            home.posts.length > 0 ? <div>
              {this.renderPostList()}
            </div> : <div></div>
          }
          <div>
            <div
              className="mt-card"
              onMouseEnter={e => this.setState( { rexExcited: true } )}
              onMouseLeave={e => this.setState( { rexExcited: false } )}
            >
              <Card>
                <CardHeader
                  action={
                    <Tooltip title="Create a new post">
                      <Button
                        onClick={e => this.props.createPost( { title: 'New Post', slug: randomId() } )}
                        variant="fab"
                        mini
                        color="primary">
                        <AddIcon />
                      </Button>
                    </Tooltip>
                  }
                  title="Add new post"
                />
              </Card>
            </div>

            {home.latestPost ? <div className="mt-card">
              {this.renderLatestPost( home.latestPost )}
            </div> : undefined}
          </div>
        </DashRow>
      </Content>
    </Container>
  }
}

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