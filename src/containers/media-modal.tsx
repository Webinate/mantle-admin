import * as React from 'react';
import { useState, useEffect } from 'react';
import { IRootState } from '../store';
import mediaActions from '../store/media/actions';
import { State as MediaState } from '../store/media/reducer';
import { State as AppState } from '../store/app/reducer';
import { MediaNavigator } from '../components/media/media-navigator';
import Dialog from '@material-ui/core/Dialog/Dialog';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Button from '@material-ui/core/Button/Button';
import { BreadCrumb } from '../components/media/bread-crumb';
import { SortOrder, File, VolumeSortType, FileSortType } from 'mantle';
import { LinearProgress } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

export type Props = {
  open: boolean;
  onCancel: () => void;
  onSelect: (file: File) => void;
};

const MediaModal: React.FC<Props> = (props) => {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const dispatch = useDispatch();
  const app = useSelector<IRootState, AppState>((state) => state.app);
  const media = useSelector<IRootState, MediaState>((state) => state.media);

  useEffect(() => {
    dispatch(
      mediaActions.getVolumes!({
        index: 0,
      })
    );
  }, []);

  const onDelete = (volumeId?: string) => {
    if (volumeId) {
      setSelectedUid(null);
      dispatch(mediaActions.deleteFiles(volumeId, [selectedUid!]));
    } else {
      setSelectedUid(null);
      dispatch(mediaActions.deleteVolumes([selectedUid!]));
    }
  };

  const onSort = (sort: VolumeSortType | FileSortType, direction: SortOrder, volumeId: string | null) => {
    if (volumeId)
      dispatch(mediaActions.openDirectory(volumeId, { sortType: sort as FileSortType, sortOrder: direction }));
    else dispatch(mediaActions.getVolumes({ sortType: sort as VolumeSortType, sortOrder: direction }));
  };

  const activeDir = media.selected;
  const selectedUids = selectedUid ? [selectedUid] : [];
  let navigator: JSX.Element | null = null;
  const style: React.CSSProperties = {
    width: '100%',
    height: '600px',
  };

  if (activeDir) {
    navigator = (
      <MediaNavigator
        animated={app.debugMode ? false : true}
        renderOptionalButtons={() => {
          return (
            <DialogActions>
              <Button id="mt-media-cancel-btn" onClick={(e) => props.onCancel()} disabled={media.busy}>
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!activeDir || !selectedUid || media.busy}
                id="mt-media-confirm-btn"
                onClick={(e) => {
                  const file = media.filesPage!.data.find((f) => (f._id as string) === selectedUid)!;
                  props.onSelect(file);
                }}
                color="primary"
              >
                Select
              </Button>
            </DialogActions>
          );
        }}
        multiselect={false}
        filesFilters={media.filesFilters}
        selectedIds={selectedUids}
        files={media.filesPage}
        style={style}
        onRename={(newName, id) => dispatch(mediaActions.editFile(activeDir._id as string, id, { name: newName }))}
        onDelete={() => onDelete(activeDir._id as string)}
        onSort={(sort, dir) => onSort(sort, dir, activeDir._id as string)}
        onUploadFiles={(files) => {
          dispatch(mediaActions.upload(activeDir._id as string, files));
        }}
        onReplaceFile={(file) => {
          dispatch(mediaActions.replaceFile(activeDir._id as string, selectedUids[0], file));
        }}
        activeVolume={media.selected}
        activeVolumeId={activeDir._id as string}
        loading={media.busy}
        onSelectionChanged={(selection) => setSelectedUid(selection[selection.length - 1])}
        openDirectory={(id, options) => dispatch(mediaActions.openDirectory(id, options))}
      />
    );
  } else {
    navigator = (
      <MediaNavigator
        animated={app.debugMode ? false : true}
        multiselect={false}
        volumeFilters={media.volumeFilters}
        selectedIds={selectedUids}
        style={style}
        onDelete={() => onDelete()}
        onRename={(newName, id) => dispatch(mediaActions.editVolume(id, { name: newName }))}
        onSort={(sort, dir) => onSort(sort, dir, null)}
        openVolume={(volume) => {
          setSelectedUid(null);
          dispatch(mediaActions.openDirectory(volume));
        }}
        onSelectionChanged={(volumes) => {
          setSelectedUid(volumes[volumes.length - 1]);
        }}
        loading={media.busy}
        volumes={media.volumePage}
        getVolumes={(options) => dispatch(mediaActions.getVolumes(options))}
      />
    );
  }

  return (
    <Dialog
      open={props.open}
      scroll="paper"
      maxWidth={false}
      onClose={() => props.onCancel()}
      PaperProps={{ style: { maxWidth: '70%' } }}
    >
      {media.busy ? <LinearProgress className="mt-loading" /> : undefined}
      <DialogContent style={{ paddingBottom: '6px' }}>
        {activeDir ? (
          <BreadCrumb
            volume={activeDir}
            onVolumeSelected={() => dispatch(mediaActions.getVolumes({ index: 0, search: '' }))}
          />
        ) : undefined}
        {navigator}
      </DialogContent>
    </Dialog>
  );
};

export default MediaModal;
