/**
 * Picks a random user avatar based on the given index
 */
export function generateAvatarPic( index: number ) {
  return `/images/avatar-${ ( index % 5 ) + 1 }.svg`;
}