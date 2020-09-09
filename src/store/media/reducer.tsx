import { ActionCreators, Action } from './actions';
import { Volume, PaginatedVolumeResponse, PaginatedFilesResponse, QueryVolumesArgs, QueryFilesArgs } from 'mantle';

// State
export type State = {
  readonly volumePage: PaginatedVolumeResponse | null;
  readonly volumeFilters: Partial<QueryVolumesArgs>;
  readonly filesPage: PaginatedFilesResponse | null;
  readonly filesFilters: Partial<QueryFilesArgs>;
  readonly selected: Volume | null;
  readonly busy: boolean;
  readonly volumeFormError: Error | null;
};

export const initialState: State = {
  volumePage: null,
  volumeFilters: { index: 0, sortType: 'created', sortOrder: 'desc' },
  filesPage: null,
  filesFilters: { index: 0, sortType: 'created', sortOrder: 'desc', search: '' },
  selected: null,
  busy: false,
  volumeFormError: null,
};

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  let partialState: Partial<State> | undefined;

  switch (action.type) {
    case ActionCreators.SetVolumes.type:
      partialState = {
        volumePage: action.payload.page,
        volumeFilters: { ...state.volumeFilters, ...action.payload.filters },
        busy: false,
      };
      break;

    case ActionCreators.SetFiles.type:
      partialState = {
        filesPage: action.payload.page,
        filesFilters: { ...state.filesFilters, ...action.payload.filters },
        busy: false,
      };
      break;

    case ActionCreators.SetVolumesBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.VolumeFormError.type:
      partialState = {
        volumeFormError: action.payload,
        busy: false,
      };
      break;

    case ActionCreators.SelectedVolume.type:
      partialState = {
        selected: action.payload,
        busy: false,
      };
      break;

    default:
      return state;
  }

  return { ...state, ...partialState } as State;
}
