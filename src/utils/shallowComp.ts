export function shallowCompare( a: any, b: any, checkFunctions: boolean = false ) {
  let i: any, val: any;
  for ( i in a ) {
    val = a[ i ]
    if ( typeof val === 'function' && checkFunctions === false )
      continue;

    if ( val !== b[ i ] )
      return false;
  }

  return true;
}