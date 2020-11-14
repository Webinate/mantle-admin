import {} from 'mocha';
import { resolve } from 'path';
import * as fs from 'fs';
import Agent from './agent';
import * as FormData from 'form-data';

export async function uploadFileToVolume(file: string, volume: string, agent: Agent) {
  const filePath = resolve(__dirname + '/../tests/media-files/' + file);

  if (!fs.existsSync(filePath)) throw new Error(`File doesnt exist: [${filePath}]`);

  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  let readStream = fs.createReadStream(filePath);
  const form = new FormData();
  form.append('file', readStream, { knownLength: fileSizeInBytes });

  const resp = await agent.post(`/api/files/volumes/${volume}/upload`, form, {
    'content-type': 'multipart/form-data',
  });

  return resp;
}
