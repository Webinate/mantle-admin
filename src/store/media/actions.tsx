import { ActionCreator } from '../actions-creator';
import { Page, IVolume, IFileEntry } from '../../../../../src';
import * as volumes from '../../../../../src/lib-frontend/volumes';
import * as files from '../../../../../src/lib-frontend/files';
import { FilesGetOptions, VolumesGetOptions } from 'mantle';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';
import { isAdminUser } from '../../utils/component-utils';
import { disptachable } from '../../decorators/dispatchable';
import { dispatchError } from '../../decorators/dispatchError';

// Action Creators
export const ActionCreators = {
  SetVolumesBusy: new ActionCreator<'media-busy', boolean>('media-busy'),
  SetVolumes: new ActionCreator<
    'media-set-volumes',
    { page: Page<IVolume<'client' | 'expanded'>>; filters: Partial<VolumesGetOptions> }
  >('media-set-volumes'),
  SetFiles: new ActionCreator<
    'media-set-files',
    { page: Page<IFileEntry<'client' | 'expanded'>>; filters: Partial<FilesGetOptions> }
  >('media-set-files'),
  SelectedVolume: new ActionCreator<'media-selected-volume', IVolume<'client' | 'expanded'> | null>(
    'media-selected-volume'
  ),
  VolumeFormError: new ActionCreator<'media-volume-form-error', Error>('media-volume-form-error'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

class Actions {
  @disptachable()
  async getVolumes(options: Partial<VolumesGetOptions>, dispatch?: Function, getState?: () => IRootState) {
    try {
      const state = getState!();
      const newFilters: Partial<VolumesGetOptions> = state.media.volumeFilters
        ? { ...state.media.volumeFilters, ...options }
        : options;

      dispatch!(ActionCreators.SelectedVolume.create(null));
      dispatch!(ActionCreators.SetVolumesBusy.create(true));
      const resp = await volumes.getAll(newFilters);
      dispatch!(ActionCreators.SelectedVolume.create(null));
      dispatch!(ActionCreators.SetVolumes.create({ page: resp, filters: newFilters }));
    } catch (err) {
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async upload(volumeId: string, filesArr: File[], dispatch?: Function, getState?: () => IRootState) {
    const state = getState!();
    const filesFilter: Partial<FilesGetOptions> = state.media.filesFilters
      ? { ...state.media.filesFilters, ...{ index: 0 } }
      : { index: 0 };

    try {
      dispatch!(ActionCreators.SetVolumesBusy.create(true));
      const promises = filesArr.map((file) => files.create(volumeId, file));
      await Promise.all(promises);

      const filePage = await files.getAll(volumeId, filesFilter);
      dispatch!(ActionCreators.SetFiles.create({ page: filePage, filters: filesFilter }));
    } catch (err) {
      const filePage = await files.getAll(volumeId, filesFilter);
      dispatch!(ActionCreators.SetFiles.create({ page: filePage, filters: filesFilter }));
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async replaceFile(volumeId: string, fileId: string, file: File, dispatch?: Function, getState?: () => IRootState) {
    const state = getState!();
    const filesFilter: Partial<FilesGetOptions> = state.media.filesFilters
      ? { ...state.media.filesFilters, ...{ index: 0 } }
      : { index: 0 };

    try {
      dispatch!(ActionCreators.SetVolumesBusy.create(true));
      await files.replaceFile(fileId, file);

      const filePage = await files.getAll(volumeId, filesFilter);
      dispatch!(ActionCreators.SetFiles.create({ page: filePage, filters: filesFilter }));
    } catch (err) {
      const filePage = await files.getAll(volumeId, filesFilter);
      dispatch!(ActionCreators.SetFiles.create({ page: filePage, filters: filesFilter }));
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async deleteFiles(volumeId: string, ids: string[], dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    try {
      const promises: Promise<Response>[] = [];
      for (const id of ids) promises.push(files.remove(id));

      await Promise.all(promises);

      const state = getState!();
      const resp = await files.getAll(volumeId, state.media.filesFilters);
      dispatch!(ActionCreators.SetFiles.create({ page: resp, filters: state.media.filesFilters }));
    } catch (err) {
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async deleteVolumes(ids: string[], dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    try {
      const promises: Promise<Response>[] = [];
      for (const id of ids) promises.push(volumes.remove(id));

      await Promise.all(promises);

      const state = getState!();
      const resp = await volumes.getAll(state.media.volumeFilters);
      dispatch!(ActionCreators.SetVolumes.create({ page: resp, filters: state.media.volumeFilters }));
    } catch (err) {
      dispatch!(ActionCreators.SetVolumesBusy.create(false));
      dispatch!(AppActions.serverResponse.create(err.message));
    }
  }

  @disptachable()
  async getVolume(id: string, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));
    const resp = await volumes.getOne(id);
    dispatch!(ActionCreators.SelectedVolume.create(resp));
  }

  @disptachable()
  async openDirectory(
    id: string,
    options: Partial<FilesGetOptions> = { index: 0 },
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    const state = getState!();
    const filesFilter = state.media.filesFilters ? { ...state.media.filesFilters, ...options } : options;

    try {
      const responses = await Promise.all([volumes.getOne(id), files.getAll(id, filesFilter)]);

      dispatch!(ActionCreators.SelectedVolume.create(responses[0]));
      dispatch!(ActionCreators.SetFiles.create({ page: responses[1], filters: filesFilter }));
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
  async editVolume(id: string, token: Partial<IVolume<'client'>>, dispatch?: Function, getState?: () => IRootState) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));
    await volumes.update(id, token);

    const state = getState!();
    const responses = await volumes.getAll(state.media.volumeFilters);
    dispatch!(ActionCreators.SetVolumes.create({ page: responses, filters: state.media.volumeFilters }));
  }

  @disptachable()
  @dispatchError(AppActions.serverResponse)
  async editFile(
    volumeId: string,
    id: string,
    token: Partial<IFileEntry<'client'>>,
    dispatch?: Function,
    getState?: () => IRootState
  ) {
    dispatch!(ActionCreators.SetVolumesBusy.create(true));

    await files.update(id, token);

    const state = getState!();
    const responses = await files.getAll(volumeId, state.media.filesFilters);
    dispatch!(ActionCreators.SetFiles.create({ page: responses, filters: state.media.filesFilters }));
  }

  @disptachable()
  async createVolume(
    token: Partial<IVolume<'client'>>,
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
        delete toSend.memoryUsed;
      }

      await volumes.create(toSend);
      let resp = await volumes.getAll(volumeFilters);
      dispatch!(ActionCreators.SetVolumes.create({ page: resp, filters: volumeFilters }));
      callback();
    } catch (err) {
      dispatch!(ActionCreators.VolumeFormError.create(err));
    }
  }
}

const actions: Actions = new Actions();
export default actions;
