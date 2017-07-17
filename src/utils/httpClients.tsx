export async function get<T>( url: string ) {
  const resp = await fetch( url );
  const data = await resp.json() as T;
  return data;
}

export async function post<T>( url: string, data: any ) {
  const resp = await fetch( url, {
    method: 'post',
    body: JSON.stringify( data ),
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
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;
  return respData;
}