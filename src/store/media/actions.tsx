import { ActionCreator } from '../actions-creator';
import { Page, IVolume } from '../../../../../src';
import * as volumes from '../../../../../src/lib-frontend/volumes';
import { IRootState } from '..';

// Action Creators
export const ActionCreators = {
  SetVolumesBusy: new ActionCreator<'media-busy', boolean>( 'media-busy' ),
  SetVolumes: new ActionCreator<'media-set-volumes', { page: Page<IVolume<'client'>>, filters: Partial<volumes.GetAllOptions> }>( 'media-set-volumes' ),
  SelectedVolume: new ActionCreator<'media-selected-volume', IVolume<'client'>>( 'media-selected-volume' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function getVolumes( options: Partial<volumes.GetAllOptions> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    const state = getState();
    const newFilters: Partial<volumes.GetAllOptions> = state.media.volumeFilters ?
      { ...state.media.volumeFilters, ...options } : options;

    dispatch( ActionCreators.SetVolumesBusy.create( true ) );
    const resp = await volumes.getAll( newFilters );
    dispatch( ActionCreators.SetVolumes.create( { page: resp, filters: newFilters } ) );
  }
}

export function getVolume( id: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetVolumesBusy.create( true ) );
    const resp = await volumes.getOne( id );
    dispatch( ActionCreators.SelectedVolume.create( resp ) );
  }
}

export function createVolume( token: Partial<IVolume<'client'>>, callback: () => void ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetVolumesBusy.create( true ) );
    const resp = await volumes.create( token );
    dispatch( ActionCreators.SelectedVolume.create( resp ) );
    callback();
  }
}