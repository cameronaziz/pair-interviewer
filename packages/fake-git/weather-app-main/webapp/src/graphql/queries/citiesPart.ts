import { gql } from '@apollo/client';

const CITIES_PART = gql`
  query Cities($name: String!) {
    Cities(name: $name) {
      id
      name
      country {
        code
      }
    }
  }
`;

export default CITIES_PART;
