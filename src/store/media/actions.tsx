import { ActionCreator } from '../actions-creator';
import { Page, IVolume, IFileEntry } from '../../../../../src';
import * as volumes from '../../../../../src/lib-frontend/volumes';
import * as files from '../../../../../src/lib-frontend/files';
import { IRootState } from '..';
import { ActionCreators as AppActions } from '../app/actions';

// Action Creators
export const ActionCreators = {
  SetVolumesBusy: new ActionCreator<'media-busy', boolean>( 'media-busy' ),
  SetVolumes: new ActionCreator<'media-set-volumes', { page: Page<IVolume<'client'>>, filters: Partial<volumes.GetAllOptions> }>( 'media-set-volumes' ),
  SetFiles: new ActionCreator<'media-set-files', { page: Page<IFileEntry<'client'>>, filters: Partial<volumes.GetAllOptions> }>( 'media-set-files' ),
  SelectedVolume: new ActionCreator<'media-selected-volume', IVolume<'client'> | null>( 'media-selected-volume' ),
  VolumeFormError: new ActionCreator<'media-volume-form-error', Error>( 'media-volume-form-error' ),
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function getVolumes( options: Partial<volumes.GetAllOptions> ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      const state = getState();
      const newFilters: Partial<volumes.GetAllOptions> = state.media.volumeFilters ?
        { ...state.media.volumeFilters, ...options } : options;

      dispatch( ActionCreators.SetVolumesBusy.create( true ) );
      dispatch( ActionCreators.SelectedVolume.create( null ) );
      const resp = await volumes.getAll( newFilters );
      dispatch( ActionCreators.SetVolumes.create( { page: resp, filters: newFilters } ) );
    }
    catch ( err ) {
      dispatch( ActionCreators.SetVolumesBusy.create( false ) );
      dispatch( AppActions.serverResponse.create( err.message ) );
    }
  }
}

export function upload( volumeId: string, filesArr: File[] ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      dispatch( ActionCreators.SetVolumesBusy.create( true ) );
      const promises = filesArr.map( file => files.create( volumeId, file ) );
      await Promise.all( promises );

      const state = getState();
      const filesFilter: Partial<files.GetAllOptions> = state.media.filesFilters ?
        { ...state.media.filesFilters, ...{ index: 0 } } : { index: 0 };

      const filePage = await files.getAll( volumeId, filesFilter );
      dispatch( ActionCreators.SetFiles.create( { page: filePage, filters: filesFilter } ) );
    }
    catch ( err ) {
      dispatch( ActionCreators.SetVolumesBusy.create( false ) );
      dispatch( AppActions.serverResponse.create( err.message ) );
    }
  }
}

export function deleteFiles( volumeId: string, ids: string[] ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetVolumesBusy.create( true ) );

    try {
      const promises: Promise<Response>[] = [];
      for ( const id of ids )
        promises.push( files.remove( id ) );

      await Promise.all( promises );

      const state = getState();
      const newFilters: Partial<files.GetAllOptions> = state.media.filesFilters ?
        { ...state.media.filesFilters, ...{ index: 0 } } : { index: 0 };

      const resp = await files.getAll( volumeId, newFilters );
      dispatch( ActionCreators.SetFiles.create( { page: resp, filters: newFilters } ) );
    }
    catch ( err ) {
      dispatch( ActionCreators.SetVolumesBusy.create( false ) );
      dispatch( AppActions.serverResponse.create( err.message ) );
    }
  }
}

export function deleteVolumes( ids: string[] ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetVolumesBusy.create( true ) );

    try {
      const promises: Promise<Response>[] = [];
      for ( const id of ids )
        promises.push( volumes.remove( id ) );

      await Promise.all( promises );

      const state = getState();
      const newFilters: Partial<volumes.GetAllOptions> = state.media.volumeFilters ?
        { ...state.media.volumeFilters, ...{ index: 0 } } : { index: 0 };

      const resp = await volumes.getAll( newFilters );

      dispatch( ActionCreators.SetVolumes.create( { page: resp, filters: newFilters } ) );
    }
    catch ( err ) {
      dispatch( ActionCreators.SetVolumesBusy.create( false ) );
      dispatch( AppActions.serverResponse.create( err.message ) );
    }
  }
}

export function getVolume( id: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetVolumesBusy.create( true ) );
    const resp = await volumes.getOne( id );
    dispatch( ActionCreators.SelectedVolume.create( resp ) );
  }
}

export function openDirectory( id: string, options: Partial<files.GetAllOptions> = { index: 0 } ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetVolumesBusy.create( true ) );

    const state = getState();
    const filesFilter: Partial<files.GetAllOptions> = state.media.filesFilters ?
      { ...state.media.filesFilters, ...options } : options;

    const responses = await Promise.all( [
      volumes.getOne( id ),
      files.getAll( id, filesFilter )
    ] );

    dispatch( ActionCreators.SelectedVolume.create( responses[ 0 ] ) );
    dispatch( ActionCreators.SetFiles.create( { page: responses[ 1 ], filters: filesFilter } ) );
  }
}

export function createVolume( token: Partial<IVolume<'client'>>, callback: () => void ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      const newFilters: Partial<volumes.GetAllOptions> = {
        index: 0
      };

      dispatch( ActionCreators.SetVolumesBusy.create( true ) );
      await volumes.create( token );
      let resp = await volumes.getAll( newFilters );
      dispatch( ActionCreators.SetVolumes.create( { page: resp, filters: newFilters } ) );
      callback();
    }
    catch ( err ) {
      dispatch( ActionCreators.VolumeFormError.create( err ) );
    }
  }
}