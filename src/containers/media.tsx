import * as React from 'react';
import { IRootState } from '../store';
import { connectWrapper, returntypeof } from '../utils/decorators';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath } from 'react-router-dom';
import { push } from 'react-router-redux';
import ContentHeader from '../components/content-header';
import { createVolume, getVolumes, getVolume, deleteVolumes, upload, openDirectory, deleteFiles } from '../store/media/actions';
import { MediaNavigator } from '../components/media/media-navigator';
import { MediaFilterBar } from '../components/media/media-filter-bar';
import { NewVolumeForm } from '../components/media/new-volume-form';
import { GetAllOptions } from '../../../../src/lib-frontend/volumes';

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
  createVolume,
  getVolumes,
  getVolume,
  openDirectory,
  deleteVolumes,
  upload,
  deleteFiles
}

const stateProps = returntypeof( mapStateToProps );
type Props = typeof stateProps & typeof dispatchToProps;
type State = {
  selectedUids: string[];
};

/**
 * The main application entry point
 */
@connectWrapper( mapStateToProps, dispatchToProps )
export class Media extends React.Component<Props, State> {

  constructor( props: Props ) {
    super( props );
    this.state = {
      selectedUids: []
    };
  }

  private onDelete( volumeId?: string ) {
    if ( volumeId )
      this.props.deleteFiles( volumeId, this.state.selectedUids );
    else
      this.props.deleteVolumes( this.state.selectedUids );
  }

  render() {
    const isInNewMode = matchPath( this.props.location.pathname, { exact: true, path: '/dashboard/media/new' } );
    const isAdmin = this.props.user && this.props.user.privileges < 2 ? true : false;
    const isInDirectory = matchPath<any>( this.props.location.pathname, { path: '/dashboard/media/volume/:id' } );
    let mode: 'new-volume' | 'volumes' | 'directory' = 'volumes';
    if ( isInNewMode )
      mode = 'new-volume';
    else if ( isInDirectory )
      mode = 'directory';

    return (
      <div style={{ height: '100%' }} className="mt-media-container">
        <ContentHeader
          title={this.props.media.selected ? this.props.media.selected.name : 'Media'}
          busy={this.props.media.busy}
          renderFilters={() => <MediaFilterBar
            mediaSelected={this.state.selectedUids.length > 0 ? true : false}
            mode={mode}
            onNewVolume={() => this.props.push( '/dashboard/media/new' )}
            onSearch={term => isInDirectory ? this.props.openDirectory( isInDirectory.params.id, { search: term } ) : this.props.getVolumes( { search: term } )}
            onBack={() => this.props.push( '/dashboard/media' )}
          />}
        >
        </ContentHeader>
        <Container>
          <Switch>
            <Route path="/dashboard/media/new" render={props => <NewVolumeForm
              isAdmin={isAdmin}
              error={this.props.media.volumeFormError}
              onComplete={newVolume => {
                this.props.createVolume( newVolume, () => this.props.push( '/dashboard/media' ) );
              }}
            />} />
            <Route path="/dashboard/media/edit/:postId" render={props => <div>Editing {props.match.params.postId}</div>} />
            <Route path="/dashboard/media/volume/:id" render={props => {
              return <MediaNavigator
                key="nav-directory"
                selectedIds={this.state.selectedUids}
                files={this.props.media.filesPage}
                onDelete={() => this.onDelete( props.match.params.id )}
                onUploadFiles={files => { this.props.upload( props.match.params.id, files ) }}
                activeVolume={this.props.media.selected}
                activeVolumeId={props.match.params.id}
                loading={this.props.media.busy}
                onSelectionChanged={selection => this.setState( { selectedUids: selection } )}
                openDirectory={id => this.props.openDirectory( id )}
              />
            }} />
            <Route path="/dashboard/media" exact={true} render={props => {
              return <MediaNavigator
                key="nav-volumes"
                selectedIds={this.state.selectedUids}
                onDelete={() => this.onDelete()}
                onUploadFiles={files => { this.props.upload( props.match.params.id, files ) }}
                openVolume={volume => this.props.push( `/dashboard/media/volume/${ volume }` )}
                onSelectionChanged={volumes => this.setState( { selectedUids: volumes } )}
                loading={this.props.media.busy}
                volumes={this.props.media.volumePage}
                getVolumes={( options: Partial<GetAllOptions> ) => this.props.getVolumes( options )}
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