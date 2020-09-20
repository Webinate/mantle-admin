import { ActionCreator } from '../actions-creator';
import { Template, PaginatedTemplateResponse } from 'mantle';
import { IRootState } from '..';
import { graphql } from '../../utils/httpClients';
import { GET_TEMPLATE, GET_TEMPLATES } from '../../graphql/requests/templates-request';

// Action Creators
export const ActionCreators = {
  GetAll: new ActionCreator<'templates-get-all', PaginatedTemplateResponse>('templates-get-all'),
  GetOne: new ActionCreator<'templates-get', Template>('templates-get'),
  SetBusy: new ActionCreator<'templates-set-busy', boolean>('templates-set-busy'),
};

// Action Types
export type Action = typeof ActionCreators[keyof typeof ActionCreators];

export function getAllTemplates() {
  return async function (dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.SetBusy.create(true));
    const page = await graphql<{ templates: PaginatedTemplateResponse }>(GET_TEMPLATES, {});
    // const page = await templates.getAll();
    dispatch(ActionCreators.GetAll.create(page.templates));
  };
}

export function getTemplate(id: string) {
  return async function (dispatch: Function, getState: () => IRootState) {
    dispatch(ActionCreators.SetBusy.create(true));
    const template = await graphql<{ template: Template }>(GET_TEMPLATE, { id });
    // const template = await templates.getOne(id);
    dispatch(ActionCreators.GetOne.create(template.template));
  };
}
