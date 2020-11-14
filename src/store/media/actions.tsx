import { ActionCreator } from '../actions-creator';
import {
  Volume,
  AddVolumeInput,
  UpdateVolumeInput,
  PaginatedFilesResponse,
  PaginatedVolumeResponse,
  UpdateFileInput,
} from 'mantle';
import * as files from '../../../../../src/lib-frontend/files';
import { QueryFilesArgs, QueryVolumesArgs } from 'mantle';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { isAdminUser } from '../../utils/component-utils';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';
import { graphql } from '../../utils/httpClients';
import {
  ADD_VOLUME,
  GET_VOLUME,
  REMOVE_VOLUME,
  GET_VOLUMES,
  PATCH_VOLUME,
  PATCH_FILE,
  GET_FILES,
  REMOVE_FILE,
} from '../../graphql/requests/media-requests';

// Action Creators
export const ActionCreators = {
  SetVolumesBusy: new ActionCreator<'media-busy', boolean>('media-busy'),
  SetVolumes: new ActionCreator<
    'media-set-volumes',
    { page: PaginatedVolumeResponse; filters: Partial<QueryVolumesArgs> }
  >('media-set-volumes'),
  SetFiles: new ActionCreator<'media-set-files', { page: PaginatedFilesResponse; filters: Partial<QueryFilesArgs> }>(
    'media-set-files'
  ),
  SelectedVolume: new ActionCreator<'media-selected-volume', Volume | null>('media-selected-volume'),
  VolumeFormError: new ActionCreator<'media-volume-form-error', Error>('media-volume-form-error'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  async getVolumes(options: Partial<QueryVolumesArgs>, dispatch?: Function, getState?: () => IRootState) {
    try {
      const state = getState!();
      const newFilters: Partial<QueryVolumesArgs> = state.media.volumeFilters
        ? { ...state.media.volumeFilters, ...options }
        : options;

      dispatch!(ActionCreators.SelectedVolume.create(null));
      dispatch!(ActionCreators.SetVolumesBusy.create(true));
      const resp = await graphql<{ volumes: PaginatedVolumeResponse }>(GET_VOLUMES, newFilters);
      // const resp = await volumes.getAll(newFilters);
      dispatch!(ActionCreators.SelectedVolume.create(null));
      dispatch!(ActionCreators.SetVolumes.create({ page: resp.volumes, filters: newFilters }));
    } catch (err) {
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async upload(volumeId: string, filesArr: any[], dispatch?: Function, getState?: () => IRootState) {
    const state = getState!();
    const filesFilter: Partial<QueryFilesArgs> = state.media.filesFilters
      ? { ...state.media.filesFilters, ...{ index: 0 } }
      : { index: 0 };

    try {
      dispatch!(ActionCreators.SetVolumesBusy.create(true));
      const promises = filesArr.map((file) => files.create(volumeId, file));
      await Promise.all(promises);

      const filePage = await graphql<{ files: PaginatedFilesResponse }>(GET_FILES, { volumeId, ...filesFilter });
      // const filePage = await files.getAll(volumeId, filesFilter);
      dispatch!(ActionCreators.SetFiles.create({ page: filePage.files, filters: filesFilter }));
    } catch (err) {
      // const filePage = await files.getAll(volumeId, filesFilter);
      const filePage = await graphql<{ files: PaginatedFilesResponse }>(GET_FILES, { volumeId, ...filesFilter });
      dispatch!(ActionCreators.SetFiles.create({ page: filePage.files, filters: filesFilter }));
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async replaceFile(volumeId: string, fileId: string, file: any, dispatch?: Function, getState?: () => IRootState) {
    const state = getState!();
    const filesFilter: Partial<QueryFilesArgs> = state.media.filesFilters
      ? { ...state.media.filesFilters, ...{ index: 0 } }
      : { index: 0 };

    try {
      dispatch!(ActionCreators.SetVolumesBusy.create(true));
      await files.replaceFile(fileId, file);

      // const filePage = await files.getAll(volumeId, filesFilter);
      const filePage = await graphql<{ files: PaginatedFilesResponse }>(GET_FILES, { volumeId, ...filesFilter });
      dispatch!(ActionCreators.SetFiles.create({ page: filePage.files, filters: filesFilter }));
    } catch (err) {
      const filePage = await graphql<{ files: PaginatedFilesResponse }>(GET_FILES, { volumeId, ...filesFilter });
      // const filePage = await files.getAll(volumeId, filesFilter);
      dispatch!(ActionCreators.SetFiles.create({ page: filePage.files, filters: filesFilter }));
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async deleteFiles(volumeId: string, ids: string[], dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    try {
      const promises: Promise<boolean>[] = [];
      for (const id of ids) {
        promises.push(
          graphql<boolean>(REMOVE_FILE, { id })
        );
        // promises.push(files.remove(id));
      }

      await Promise.all(promises);

      const state = getState!();
      const resp = await graphql<{ files: PaginatedFilesResponse }>(GET_FILES, {
        volumeId,
        ...state.media.filesFilters,
      });
      // const resp = await files.getAll(volumeId, state.media.filesFilters);
      dispatch!(ActionCreators.SetFiles.create({ page: resp.files, filters: state.media.filesFilters }));
    } catch (err) {
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async deleteVolumes(ids: string[], dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    try {
      const promises: Promise<{ removeVolume: boolean }>[] = [];
      for (const id of ids) {
        promises.push(
          graphql<{ removeVolume: boolean }>(REMOVE_VOLUME, { id })
        );
        // promises.push(volumes.remove(id));
      }

      await Promise.all(promises);

      const state = getState!();

      const resp = await graphql<{ volumes: PaginatedVolumeResponse }>(GET_VOLUMES, state.media.volumeFilters);
      // const resp = await volumes.getAll(state.media.volumeFilters);
      dispatch!(ActionCreators.SetVolumes.create({ page: resp.volumes, filters: state.media.volumeFilters }));
    } catch (err) {
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async getVolume(id: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));
    // const resp = await volumes.getOne(id);
    const resp = await graphql<{ volume: Volume }>(GET_VOLUME, { id });
    dispatch!(ActionCreators.SelectedVolume.create(resp.volume));
  }

  @disptachable()
  async openDirectory(
    id: string,
    options: Partial<QueryFilesArgs> = { index: 0 },
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    const state = getState!();
    const filesFilter = state.media.filesFilters ? { ...state.media.filesFilters, ...options } : options;

    try {
      // const responses = await Promise.all([volumes.getOne(id), files.getAll(id, filesFilter)]);
      const responses = await Promise.all([
        graphql<{ volume: Volume }>(GET_VOLUME, { id }),
        graphql<{ files: PaginatedFilesResponse }>(GET_FILES, { volumeId: id, ...filesFilter }),
      ]);

      dispatch!(ActionCreators.SelectedVolume.create(responses[0].volume));
      dispatch!(ActionCreators.SetFiles.create({ page: responses[1].files, filters: filesFilter }));
    } catch (err) {
      dispatch!(AppActions.serverResponse.create(err.message));
      dispatch!(
        ActionCreators.SetFiles.create({
          page: {
            count: 0,
            data: [],
            index: 0,
            limit: 10,
          },
          filters: filesFilter,
        })
      );
    }
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse)
  async editVolume(token: Partial<UpdateVolumeInput>, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));
    await graphql<{ updateVolume: Volume }>(PATCH_VOLUME, { token: token });
    // await volumes.update(id, token);

    const state = getState!();
    // const responses = await volumes.getAll(state.media.volumeFilters);
    const resp = await graphql<{ volumes: PaginatedVolumeResponse }>(GET_VOLUMES, state.media.volumeFilters);
    dispatch!(ActionCreators.SetVolumes.create({ page: resp.volumes, filters: state.media.volumeFilters }));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse)
  async editFile(volumeId: string, token: Partial<UpdateFileInput>, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    // await files.update(id, token);
    await graphql<File>(PATCH_FILE, { token });

    const state = getState!();
    const filePage = await graphql<{ files: PaginatedFilesResponse }>(GET_FILES, {
      volumeId,
      ...state.media.filesFilters,
    });
    // const responses = await files.getAll(volumeId, state.media.filesFilters);
    dispatch!(ActionCreators.SetFiles.create({ page: filePage.files, filters: state.media.filesFilters }));
  }

  @disptachable()
  async createVolume(
    token: Partial<AddVolumeInput>,
    callback: () => void,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    try {
      const state = getState!();
      const volumeFilters = state.media.volumeFilters
        ? { ...state.media.volumeFilters, ...{ index: 0 } }
        : { index: 0 };

      dispatch!(ActionCreators.SetVolumesBusy.create(true));

      const toSend = { ...token };
      if (!isAdminUser(state.authentication.user)) {
        delete toSend.memoryAllocated;
      }

      await graphql<{ addVolume: Volume }>(ADD_VOLUME, { token: toSend });
      const resp = await graphql<{ volumes: PaginatedVolumeResponse }>(GET_VOLUMES, state.media.volumeFilters);

      // await volumes.create(toSend);
      // let resp = await volumes.getAll(volumeFilters);
      dispatch!(ActionCreators.SetVolumes.create({ page: resp.volumes, filters: volumeFilters }));
      callback();
    } catch (err) {
      dispatch!(ActionCreators.VolumeFormError.create(err));
    }
  }
}

const actions: Actions = new Actions();
export default actions;
