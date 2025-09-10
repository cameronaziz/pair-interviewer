import { gql } from '@apollo/client';
import GEOMETRY from './geometry';

const COUNTRY = gql`
  query Country($code: String!) {
    Country(code: $code) {
      name
      code
      average {
        low
        day
        high
        rain
      }
      boundingBox {
        width
        height
        center {
          latitude
          longitude
        }
      }
      cities {
        id
        name
        coordinates {
          latitude
          longitude
        }
        average {
          low
          day
          high
          rain
        }
      }
      geometry {
        ...GeometryParts
      }
    }
  }

  ${GEOMETRY}
`;

export default COUNTRY;
