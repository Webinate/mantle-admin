import { Action } from 'redux';
import { ActionCreators as MediaActions } from '../store/media/actions';
import { matchPath } from 'react-router';
import { RedirectError } from './errors';
import { QueryVolumesArgs, QueryFilesArgs } from 'mantle';
import { SortOrder, VolumeSortType, FilesGetOptions, VolumesGetOptions } from '../../../../src/core/enums';
import { User } from 'mantle';
import controllerFactory from '../../../../src/core/controller-factory';
import { Volume, PaginatedVolumeResponse } from '../../../../src/graphql/models/volume-type';
import { PaginatedFilesResponse } from '../../../../src/graphql/models/file-type';

export default async function (url: string, user: User | null, actions: Action[]) {
  const volumesView = matchPath<any>(url, { path: '/dashboard/media/volumes/:id' });
  const initialVolumeFilter: Partial<VolumesGetOptions> = {
    index: 0,
    search: '',
    sortType: VolumeSortType.created,
    sortOrder: SortOrder.desc,
  };

  if (volumesView) {
    let volume = await controllerFactory.get('volumes').get({ id: volumesView.params.id });
    if (!volume) throw new RedirectError('/dashboard/media');

    const initialFileFilter: Partial<FilesGetOptions> = {
      volumeId: volume._id.toString(),
      index: 0,
      search: '',
      sortType: VolumeSortType.created,
      sortOrder: SortOrder.desc,
    };

    let files = await controllerFactory.get('files').getFiles(initialFileFilter);
    actions.push(MediaActions.SelectedVolume.create(Volume.fromEntity(volume)));
    actions.push(
      MediaActions.SetFiles.create({
        page: PaginatedFilesResponse.fromEntity(files),
        filters: initialFileFilter as QueryFilesArgs,
      })
    );
  } else {
    let volumes = await controllerFactory.get('volumes').getMany(initialVolumeFilter);
    actions.push(
      MediaActions.SetVolumes.create({
        page: PaginatedVolumeResponse.fromEntity(volumes),
        filters: initialVolumeFilter as QueryVolumesArgs,
      })
    );
  }
}
