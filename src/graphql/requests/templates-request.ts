import gql from '../../utils/gql';

export const TEMPLATES_FRAG = gql`
  fragment TemplateFields on Template {
    _id
    defaultZone
    description
    name
    zones
  }
`;

export const GET_TEMPLATES = gql`
  query GET_TEMPLATES {
    templates {
      count
      index
      limit
      data {
        ...TemplateFields
      }
    }
  }

  ${TEMPLATES_FRAG}
`;

export const GET_TEMPLATE = gql`
  query GET_TEMPLATE($id: ObjectId!) {
    template(id: $id) {
      ...TemplateFields
    }
  }
  ${TEMPLATES_FRAG}
`;
