import { useQuery } from '@apollo/client';
import { useCallback, useContext, useLayoutEffect, VFC } from 'react';
import FourOhFour from '../../components/fourOhFour';
import Loading from '../../components/loading';
import SVGMap from '../../components/SVGMap';
import RoutingContext from '../../context/routing';
import UIContext from '../../context/ui';
import queries from '../../graphql/queries';
import useMap from '../../hooks/useMap';
import './style.css';

const WorldMap: VFC = () => {
  const { navigate } = useContext(RoutingContext);
  const { viewType, isLoading } = useContext(UIContext);
  const { data, loading, error } = useQuery<GraphQL.Query.Countries, GraphQL.Query.CountriesArgs>(queries.COUNTRIES, { variables: { withAverages: true } });
  const [drawMap] = useMap();

  const onClick = useCallback(
    (country: App.Feature<GraphQL.Country>) => {
      navigate('country', { code: country.code });
    },
    [navigate],
  );

  useLayoutEffect(
    () => {
      if (!data || !data.Countries) {
        return;
      }

      drawMap({
        countries: data.Countries,
        onClick,
      })
    },
    [data, onClick, viewType],
  );

  if (loading || isLoading) {
    return <Loading />;
  }

  if (error) {
    return <FourOhFour />;
  }

  return (
    <SVGMap />
  );
};

export default WorldMap;
