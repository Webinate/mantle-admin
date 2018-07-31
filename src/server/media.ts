import { IAuthReq } from '../../../../src';
import { Action } from 'redux';
import { controllers } from '../../../../src';
import { ActionCreators as MediaActions } from '../store/media/actions';

export default async function( req: IAuthReq, actions: Action[] ) {
  const isAdmin = req._user && req._user.privileges < 2 ? true : false;
  let volumes = await controllers.volumes.getMany( { user: isAdmin ? undefined : req._user!.username as string } );
  actions.push( MediaActions.SetVolumes.create( { page: volumes, filters: { index: 0, search: '' } } ) );
}