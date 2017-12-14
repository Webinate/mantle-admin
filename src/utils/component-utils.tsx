/**
 * Picks a random user avatar based on the given index
 */
export function generateAvatarPic( avatar: string ) {
  if ( !avatar )
    return `/images/avatar-1.svg`;

  const userNum = parseInt( avatar );
  if ( isNaN( userNum ) )
    return avatar;
  else
    return `/images/avatar-${ ( userNum % 5 ) + 1 }.svg`;
}