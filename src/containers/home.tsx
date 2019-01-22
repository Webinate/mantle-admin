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
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ShareIcon from '@material-ui/icons/Share';
import { IPost } from '../../../../src';
import * as format from 'date-fns/format';

// Map state to props
const mapStateToProps = ( state: IRootState ) => ( {
  user: state.authentication.user,
  home: state.home,
  app: state.app
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  push: push,
  getHomeElements
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  postExpanded: boolean;
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Home extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      postExpanded: false
    };
  }

  componentDidMount() {
    this.props.getHomeElements();
  }

  private renderLatestPost( post: IPost<'expanded'> | null ) {
    if ( !post )
      return (
        <Card>
          <CardHeader
            title="No New Posts"
            action={
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            }
          />
          <CardMedia style={{
            height: 0,
            paddingTop: '56.25%'
          }}
            image="../images/rocks.svg"
          />
        </Card>
      );

    return (
      <Card style={{ maxWidth: '600px' }}>
        <CardHeader
          avatar={<Avatar src={generateAvatarPic( post.author )} />}
          action={
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          }
          title={post.title || ''}
          subheader={format( new Date( post.createdOn ), 'MMM Do, YYYY' )}
        />
        <CardMedia
          style={{
            height: 0,
            paddingTop: '56.25%'
          }}
          image={post && post.featuredImage ? post.featuredImage.publicURL : ''}
        />
        <CardContent>
          {post.brief ?
            post.brief : ( post.document.elements.length > 0 ? <p dangerouslySetInnerHTML={{ __html: post.document.elements[ 0 ].html }} /> : undefined )}
        </CardContent>
        <CardActions disableActionSpacing>
          <IconButton aria-label="Share">
            <ShareIcon />
          </IconButton>
          <IconButton
            onClick={e => this.setState( { postExpanded: !this.state.postExpanded } )}
            aria-expanded={this.state.postExpanded}
            aria-label="Show more"
          >
            {this.state.postExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </CardActions>
        <Collapse in={this.state.postExpanded} timeout="auto" unmountOnExit>
          <CardContent>
            {post.document.template.zones.map( zone => <div>
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
    return <div>
      {posts.map( p => <div>{p.title}</div> )}
    </div>
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
        <DashRow>
          <DashSquare>
            <h3>Recent Posts</h3>
            {this.renderPostList()}
          </DashSquare>
          <DashSquare>
            {this.renderLatestPost( home.latestPost )}
          </DashSquare>
        </DashRow>

        <DashRow>
          <DashSquare>

          </DashSquare>
          <DashSquare>

          </DashSquare>
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
`;

const DashRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DashSquare = styled.div`
  flex: 1;
  margin: 30px;
  border-radius: 5px;
  padding: 10px;
  overflow: hidden;
`;