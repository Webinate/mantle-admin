import fetch from 'node-fetch';
import { ServerError } from './server-error';

export async function graphql<T>(host: string, query: string, variables: any, headers?: any) {
  const resp = await fetch(host + '/graphql', {
    method: 'post',
    body: JSON.stringify({
      query,
      variables,
    }),
    headers: {
      ...headers,
      'content-type': 'application/json',
      accept: 'application/json',
    },
  });

  const json = await resp.json();
  const data = json.data as T;
  const errors = json.errors as { message: string }[];
  if (errors && errors.length > 0) throw new ServerError(errors[0].message, 400);
  return data;
}
