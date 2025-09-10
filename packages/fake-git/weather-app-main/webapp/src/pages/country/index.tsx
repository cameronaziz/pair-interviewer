import { useLazyQuery, useQuery } from '@apollo/client';
import { useContext, useEffect, useLayoutEffect, VFC } from 'react';
import FourOhFour from '../../components/fourOhFour';
import Loading from '../../components/loading';
import SVGMap from '../../components/SVGMap';
import context from '../../context/routing';
import UIContext from '../../context/ui';
import queries from '../../graphql/queries';
import useMap from '../../hooks/useMap';

const Country: VFC = () => {
  const { params } = useContext(context);
  const { data: countriesData } = useQuery(queries.COUNTRIES, { variables: { withAverages: true } });
  const [getCountry, { data, loading, error }] = useLazyQuery<GraphQL.Query.CountryFull, GraphQL.Query.CountryFullArgs>(queries.COUNTRY);
  const [drawMap] = useMap();
  const { setModalFeature } = useContext(UIContext);

  useEffect(
    () => {
      if (params.code) {
        getCountry({ variables: { code: params['code'] } });
      }
    },
    [getCountry, params],
  );

  useLayoutEffect(
    () => {
      if (data && data.Country && countriesData && countriesData.Countries) {
        const { boundingBox } = data.Country;
        drawMap({
          onClick: setModalFeature,
          countries: countriesData.Countries,
          zoomCountry: data.Country,
          center: [boundingBox.center.latitude, boundingBox.center.longitude],
        })
      }
    },
    [data, countriesData],
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <FourOhFour />;
  }

  return (
    <SVGMap />
  );
};

export default Country;
