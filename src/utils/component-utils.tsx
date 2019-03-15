import { IUserEntry, IFileEntry } from '../../../../src';

/**
 * Picks a random user avatar based on the given index
 */
export function generateAvatarPic(avatar: IUserEntry<'client' | 'expanded'> | null) {
  if (avatar === null) return '/images/avatar-blank.svg';

  if (!avatar.avatar) return `/images/avatar-1.svg`;

  if (avatar.avatarFile) return (avatar.avatarFile as IFileEntry<'client'>).publicURL!;

  const userNum = parseInt(avatar.avatar);
  if (isNaN(userNum)) return avatar.avatar as string;
  else return `/images/avatar-${(userNum % 5) + 1}.svg`;
}

/**
 * Generates a string of formatted bytes
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  let k = 1024,
    dm = decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Gets if the current user is an admin
 */
export function isAdminUser(user: IUserEntry<'client' | 'expanded'> | null) {
  return user && user.privileges !== 'regular' ? true : false;
}
