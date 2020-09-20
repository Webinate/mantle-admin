import * as React from 'react';
import { useState } from 'react';
import { IRootState } from '../store';
import { default as styled } from '../theme/styled';
import { Route, Switch, matchPath, useLocation } from 'react-router-dom';
import { push } from 'react-router-redux';
import ContentHeader from '../components/content-header';
import mediaActions from '../store/media/actions';
import { MediaNavigator } from '../components/media/media-navigator';
import { MediaFilterBar } from '../components/media/media-filter-bar';
import { NewVolumeForm } from '../components/media/new-volume-form';
import { isAdminUser } from '../utils/component-utils';
import { VolumeSortType, FileSortType, SortOrder } from 'mantle';
import { State as MediaState } from '../store/media/reducer';
import { State as AppState } from '../store/app/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { User } from 'mantle';

/**
 * The main application entry point
 */
const Media: React.FC = (props) => {
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const location = useLocation();
  const dispatch = useDispatch();
  const app = useSelector<IRootState, AppState>((state) => state.app);
  const media = useSelector<IRootState, MediaState>((state) => state.media);
  const user = useSelector<IRootState, User | null>((state) => state.authentication.user);

  const onDelete = (volumeId?: string) => {
    if (volumeId) {
      setSelectedUids([]);
      dispatch(mediaActions.deleteFiles(volumeId, selectedUids));
    } else {
      setSelectedUids([]);
      dispatch(mediaActions.deleteVolumes(selectedUids));
    }
  };

  const onSort = (sort: VolumeSortType | FileSortType, direction: SortOrder, volumeId: string | null) => {
    if (volumeId)
      dispatch(mediaActions.openDirectory(volumeId, { sortType: sort as FileSortType, sortOrder: direction }));
    else dispatch(mediaActions.getVolumes({ sortType: sort as VolumeSortType, sortOrder: direction }));
  };

  const isInNewMode = matchPath(location.pathname, { exact: true, path: '/dashboard/media/new' });
  const isAdmin = isAdminUser(user);
  const isInDirectory = matchPath<any>(location.pathname, { path: '/dashboard/media/volume/:id' });
  let mode: 'new-volume' | 'volumes' | 'directory' = 'volumes';
  if (isInNewMode) mode = 'new-volume';
  else if (isInDirectory) mode = 'directory';

  return (
    <div style={{ height: '100%' }} className="mt-media-container">
      <ContentHeader
        title={media.selected ? media.selected.name : 'Media'}
        busy={media.busy}
        renderFilters={() => (
          <MediaFilterBar
            mediaSelected={selectedUids.length > 0 ? true : false}
            mode={mode}
            onNewVolume={() => dispatch(push('/dashboard/media/new'))}
            onSearch={(term) =>
              isInDirectory
                ? dispatch(mediaActions.openDirectory(isInDirectory.params.id, { search: term }))
                : dispatch(mediaActions.getVolumes({ search: term }))
            }
            onBack={() => dispatch(push('/dashboard/media'))}
          />
        )}
      />
      <Container>
        <Switch>
          <Route
            path="/dashboard/media/new"
            render={(props) => (
              <NewVolumeForm
                isAdmin={isAdmin}
                animated={!app.debugMode}
                error={media.volumeFormError}
                onComplete={(newVolume) => {
                  dispatch(mediaActions.createVolume(newVolume, () => dispatch(push('/dashboard/media'))));
                }}
              />
            )}
          />
          <Route
            path="/dashboard/media/edit/:postId"
            render={(props) => <div>Editing {props.match.params.postId}</div>}
          />
          <Route
            path="/dashboard/media/volume/:id"
            render={(props) => {
              return (
                <MediaNavigator
                  animated={app.debugMode ? false : true}
                  key="nav-directory"
                  filesFilters={media.filesFilters}
                  selectedIds={selectedUids}
                  files={media.filesPage}
                  onRename={(newName, id) =>
                    dispatch(mediaActions.editFile(props.match.params.id, id, { name: newName }))
                  }
                  onDelete={() => onDelete(props.match.params.id)}
                  onSort={(sort, dir) => onSort(sort, dir, props.match.params.id)}
                  onUploadFiles={(files) => {
                    dispatch(mediaActions.upload(props.match.params.id, files));
                  }}
                  onReplaceFile={(file) => {
                    dispatch(mediaActions.replaceFile(props.match.params.id, selectedUids[0], file));
                  }}
                  activeVolume={media.selected}
                  activeVolumeId={props.match.params.id}
                  loading={media.busy}
                  onSelectionChanged={(selection) => setSelectedUids(selection)}
                  openDirectory={(id, options) => dispatch(mediaActions.openDirectory(id, options))}
                />
              );
            }}
          />
          <Route
            path="/dashboard/media"
            exact={true}
            render={(props) => {
              return (
                <MediaNavigator
                  animated={app.debugMode ? false : true}
                  key="nav-volumes"
                  volumeFilters={media.volumeFilters}
                  selectedIds={selectedUids}
                  onDelete={() => onDelete()}
                  onRename={(newName, id) => dispatch(mediaActions.editVolume(id, { name: newName }))}
                  onSort={(sort, dir) => onSort(sort, dir, null)}
                  openVolume={(volume) => dispatch(push(`/dashboard/media/volume/${volume}`))}
                  onSelectionChanged={(volumes) => setSelectedUids(volumes)}
                  loading={media.busy}
                  volumes={media.volumePage}
                  getVolumes={(options) => dispatch(mediaActions.getVolumes(options))}
                />
              );
            }}
          />
        </Switch>
      </Container>
    </div>
  );
};

export default Media;

const Container = styled.div`
  overflow: auto;
  padding: 0;
  height: calc(100% - 50px);
  box-sizing: border-box;
`;
