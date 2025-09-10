import { gql } from '@apollo/client';
import GEOMETRY from './geometry';

const COUNTRIES = gql`
  query Countries($withAverages: Boolean!) {
    Countries {
      name
      code
      average @include(if: $withAverages) {
        low
        day
        high
        rain
      }
      geometry {
        ...GeometryParts
      }
    }
  }

  ${GEOMETRY}
`;

export default COUNTRIES;
