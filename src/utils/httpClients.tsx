export const apiUrl = "/api";

export async function get<T>( url: string ) {
  const resp = await fetch( url, {
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );
  const data = await resp.json() as T;
  return data;
}

export async function post<T>( url: string, data: any ) {
  const resp = await fetch( url, {
    method: 'post',
    body: JSON.stringify( data ),
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;
  return respData;
}

export async function del<T>( url: string, data?: any ) {
  const resp = await fetch( url, {
    method: 'delete',
    body: data ? JSON.stringify( data ) : undefined,
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;
  return respData;
}

export async function put<T>( url: string, data?: any ) {
  const resp = await fetch( url, {
    method: 'put',
    body: data ? JSON.stringify( data ) : undefined,
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;
  return respData;
}