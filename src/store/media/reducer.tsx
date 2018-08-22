import { ActionCreators, Action } from './actions';
import * as volumes from '../../../../../src/lib-frontend/volumes';
import * as files from '../../../../../src/lib-frontend/files';
import { Page, IVolume, IFileEntry } from '../../../../../src';

// State
export type State = {
  readonly volumePage: Page<IVolume<'client'>> | null;
  readonly volumeFilters: Partial<volumes.GetAllOptions>;
  readonly filesPage: Page<IFileEntry<'client'>> | null;
  readonly filesFilters: Partial<files.GetAllOptions>;
  readonly selected: IVolume<'client'> | null;
  readonly busy: boolean;
  readonly volumeFormError: Error | null;
};

export const initialState: State = {
  volumePage: null,
  volumeFilters: { index: 0, sort: 'created', sortOrder: 'desc' },
  filesPage: null,
  filesFilters: { index: 0, search: '' },
  selected: null,
  busy: false,
  volumeFormError: null
};

// Reducer
export default function reducer( state: State = initialState, action: Action ): State {
  let partialState: Partial<State> | undefined;

  switch ( action.type ) {
    case ActionCreators.SetVolumes.type:
      partialState = {
        volumePage: action.payload.page,
        volumeFilters: action.payload.filters,
        busy: false
      };
      break;

    case ActionCreators.SetFiles.type:
      partialState = {
        filesPage: action.payload.page,
        filesFilters: action.payload.filters,
        busy: false
      };
      break;

    case ActionCreators.SetVolumesBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.VolumeFormError.type:
      partialState = {
        volumeFormError: action.payload,
        busy: false
      };
      break;

    case ActionCreators.SelectedVolume.type:
      partialState = {
        selected: action.payload,
        busy: false
      };
      break;

    default: return state;
  }

  return { ...state, ...partialState } as State;
}