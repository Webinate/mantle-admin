import { } from 'mocha';
import { IVolume, IUserEntry } from 'modepress';
import { resolve } from 'path';
import { statSync } from 'fs';
import ControllerFactory from 'modepress/src/core/controller-factory';

export class File {
  name: string;
  path: string;
  size: number;
  type: string;
  constructor( name: string, path: string, size: number, type: string ) {
    this.name = name;
    this.path = path;
    this.size = size;
    this.type = type;
  }

  toJSON() {
    return this;
  }
}

export async function uploadFileToVolume( file: string, volume: IVolume<'client'> ) {
  const files = ControllerFactory.get( 'files' );
  const filePath = resolve( __dirname + '/../tests/media-files/' + file );
  const f = new File( 'test-file', filePath, statSync( filePath ).size, 'image/png' );
  return await files.uploadFileToRemote( f, { ...volume, user: ( volume.user as IUserEntry<'client'> )._id }, false );
}