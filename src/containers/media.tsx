import * as React from 'react';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import ContentHeader from '../components/content-header';
import { createVolume } from '../store/media/actions';
import { MediaNavigator } from '../components/media/media-navigator';
import { MediaFilterBar } from '../components/media/media-filter-bar';
import { NewVolumeForm } from '../components/media/new-volume-form';

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
  push: push,
  createVolume
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Media extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
    };
  }

  render() {
    const isInNewMode = matchPath( this.props.location.pathname, { exact: true, path: '/dashboard/media/new' } );
    const isAdmin = this.props.user && this.props.user.privileges < 2 ? true : false;

    return (
      <div style={{ height: '100%' }} className="mt-media-container">
        <ContentHeader
          title="Media"
          busy={false}
          renderFilters={() => <MediaFilterBar
            mode={isInNewMode ? 'new-volume' : 'volumes'}
            onNewVolume={() => this.props.push( '/dashboard/media/new' )}
            onBack={() => this.props.push( '/dashboard/media' )}
          />}
        >
        </ContentHeader>
        <Container>
          <Switch>
            <Route path="/dashboard/media/new" render={props => <NewVolumeForm
              isAdmin={isAdmin}
              onComplete={newVolume => this.props.createVolume( newVolume, () => this.props.push( '/dashboard/media' ) )}
            />} />
            <Route path="/dashboard/media/edit/:postId" render={props => <div>Editing {props.match.params.postId}</div>} />
            <Route path="/dashboard/media" exact={true} render={props => {
              return <MediaNavigator
                loading={this.props.media.busy}
                volumes={this.props.media.volumePage}
              />;
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