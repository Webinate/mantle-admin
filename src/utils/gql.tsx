import gqlTag from 'graphql-tag';

export default function stringGqlTag(strings: any, ...expressions: any): string {
  return gqlTag(strings, ...expressions).loc?.source.body!;
}

export const gql = stringGqlTag;
