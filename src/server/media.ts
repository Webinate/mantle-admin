import { IAuthReq } from '../../../../src';
import { Action } from 'redux';
import { controllers } from '../../../../src';
import { ActionCreators as MediaActions } from '../store/media/actions';
import { matchPath } from 'react-router';
import { RedirectError } from './errors';

export default async function( req: IAuthReq, actions: Action[] ) {
  const isAdmin = req._user && req._user.privileges < 2 ? true : false;
  const volumesView = matchPath<any>( req.url, { path: '/dashboard/media/volumes/:id' } );

  if ( volumesView ) {
    let volume = await controllers.volumes.get( { id: volumesView.params.id } );
    if ( !volume )
      throw new RedirectError( '/dashboard/media' );

    let files = await controllers.files.getFiles( { volumeId: volume._id.toString() } );
    actions.push( MediaActions.SelectedVolume.create( volume ) );
    actions.push( MediaActions.SetFiles.create( { page: files, filters: { index: 0, search: '', sort: 'created', sortOrder: 'desc' } } ) );
  }
  else {
    let volumes = await controllers.volumes.getMany( { user: isAdmin ? undefined : req._user!.username as string } );
    actions.push( MediaActions.SetVolumes.create( { page: volumes, filters: { index: 0, search: '', sort: 'created', sortOrder: 'desc' } } ) );
  }
}