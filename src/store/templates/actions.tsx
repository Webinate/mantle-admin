import { ActionCreator } from '../actions-creator';
import * as templates from '../../../../../src/lib-frontend/templates';
import { ITemplate, Page } from 'modepress';
import { IRootState } from '..';

// Action Creators
export const ActionCreators = {
  GetAll: new ActionCreator<'templates-get-all', Page<ITemplate<'client'>>>( 'templates-get-all' ),
  GetOne: new ActionCreator<'templates-get', ITemplate<'client'>>( 'templates-get' ),
  SetBusy: new ActionCreator<'templates-set-busy', boolean>( 'templates-set-busy' ),
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function getAllTemplates() {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetBusy.create( true ) );
    const page = await templates.getAll();
    dispatch( ActionCreators.GetAll.create( page ) );
  }
}

export function getTemplate( id: string ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetBusy.create( true ) );
    const template = await templates.getOne( id );
    dispatch( ActionCreators.GetOne.create( template ) );
  }
}