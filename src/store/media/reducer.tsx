import { ActionCreators, Action } from './actions';
import * as volumes from '../../../../../src/lib-frontend/volumes';
import { Page, IVolume } from '../../../../../src';

// State
export type State = {
  readonly volumePage: Page<IVolume<'client'>> | null;
  readonly volumeFilters: Partial<volumes.GetAllOptions> | null;
  readonly selected: IVolume<'client'> | null;
  readonly busy: boolean;
  readonly volumeFormError: Error | null;
};

export const initialState: State = {
  volumePage: null,
  volumeFilters: null,
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

    case ActionCreators.SetVolumesBusy.type:
      partialState = { busy: action.payload };
      break;

    case ActionCreators.VolumeFormError.type:
      partialState = { volumeFormError: action.payload };
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