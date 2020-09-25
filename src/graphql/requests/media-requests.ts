import gql from '../../utils/gql';

export const VOLUME_FRAG = gql`
  fragment VolumeFields on Volume {
    _id
    created
    identifier
    memoryAllocated
    memoryUsed
    meta
    name
    type
    user {
      _id
      username
    }
  }
`;

export const File_FRAG = gql`
  fragment FileFields on File {
    _id
    created
    identifier
    isPublic
    meta
    mimeType
    name
    numDownloads
    parentFile {
      _id
      name
    }
    publicURL
    size
    user {
      _id
      username
    }
  }
`;

export const GET_VOLUME = gql`
  query GET_VOLUME($id: ObjectId!) {
    volume(id: $id) {
      ...VolumeFields
    }
  }
  ${VOLUME_FRAG}
`;

export const ADD_VOLUME = gql`
  mutation ADD_VOLUME($token: AddVolumeInput!) {
    addVolume(token: $token) {
      ...VolumeFields
    }
  }
  ${VOLUME_FRAG}
`;

export const PATCH_VOLUME = gql`
  mutation PATCH_VOLUME($token: UpdateVolumeInput!) {
    updateVolume(token: $token) {
      ...VolumeFields
    }
  }
  ${VOLUME_FRAG}
`;

export const REMOVE_VOLUME = gql`
  mutation REMOVE_VOLUME($id: ObjectId!) {
    removeVolume(id: $id)
  }
`;

export const GET_VOLUMES = gql`
  query GET_VOLUMES(
    $index: Int
    $limit: Int
    $search: String
    $sortOrder: SortOrder
    $sortType: VolumeSortType
    $user: String
  ) {
    volumes(index: $index, limit: $limit, search: $search, sortOrder: $sortOrder, sortType: $sortType, user: $user) {
      count
      index
      limit
      data {
        ...VolumeFields
      }
    }
  }

  ${VOLUME_FRAG}
`;

export const GET_FILES = gql`
  query GET_FILES(
    $volumeId: ObjectId
    $index: Int
    $limit: Int
    $search: String
    $sortOrder: SortOrder
    $sortType: FileSortType
    $user: String
  ) {
    files(
      volumeId: $volumeId
      index: $index
      limit: $limit
      search: $search
      sortOrder: $sortOrder
      sortType: $sortType
      user: $user
    ) {
      count
      index
      limit
      data {
        ...FileFields
      }
    }
  }

  ${File_FRAG}
`;

export const PATCH_FILE = gql`
  mutation PATCH_FILE($token: UpdateFileInput!) {
    patchFile(token: $token) {
      ...FileFields
    }
  }
  ${File_FRAG}
`;

export const GET_FILE = gql`
  query GET_FILE($id: ObjectId!) {
    file(id: $id) {
      ...FileFields
    }
  }

  ${File_FRAG}
`;

export const REMOVE_FILE = gql`
  mutation REMOVE_FILE($id: ObjectId!) {
    removeFile(id: $id)
  }
`;
