import * as React from 'react';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { IPost } from '../../../../src';
import { default as styled } from '../theme/styled';
import { Route, Switch } from 'react-router-dom';
import { push } from 'react-router-redux';
import ContentHeader from '../components/content-header';
import { MediaNavigator } from '../components/media/media-navigator';

// Map state to props
const mapStateToProps = ( state: IRootState, ownProps: any ) => ( {
  user: state.authentication.user,
  app: state.app,
  media: state.media,
  routing: state.router,
  location: ownProps.location as Location
} );

// Map actions to props (This binds the actions to the dispatch fucntion)
const dispatchToProps = {
  push: push
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  searchFilter: string;
  selectedPosts: IPost<'client'>[];
  showDeleteModal: boolean;
  filtersOpen: boolean;
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Media extends React.Component<Props, State> {
  render() {
    return (
      <div style={{ height: '100%' }} className="mt-media-container">
        <ContentHeader
          title="Media"
          busy={false}
        >
        </ContentHeader>
        <Container>
          <Switch>
            <Route path="/dashboard/media/new" render={props => <div>New Media</div>} />
            <Route path="/dashboard/media/edit/:postId" render={props => <div>Editing {props.match.params.postId}</div>} />
            <Route path="/dashboard/media" exact={true} render={props => {
              return <MediaNavigator volumes={this.props.media.volumePage!.data} />;
            }} />
          </Switch>
        </Container>
      </div>
    );
  }
}

const Container = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;