import { useLazyQuery } from '@apollo/client';
import { useContext, useEffect, VFC } from 'react';
import UIContext from '../../context/ui';
import queries from '../../graphql/queries';
import useRouter from '../../hooks/useRouter';

type SearchResultProps = {
  city: GraphQL.CityPart;
  selectResult(): void;
}

const SearchResult: VFC<SearchResultProps> = (props) => {
  const { city, selectResult } = props;
  const [navigate] = useRouter();
  const [getCity, { data }] = useLazyQuery<GraphQL.Query.CityFull, GraphQL.Query.CityFullArgs>(queries.CITY_FULL)
  const {setModalFeature, toggleLoading } = useContext(UIContext);

  useEffect(
    () => {
      if (data) {
        setModalFeature(data.City);
        navigate('country', { code: city.country.code, city: city });
        selectResult();
      }
    },
    [data],
    );

    const onClick = () => {
      toggleLoading(true);
      getCity({ variables: { id: city.id } });
  };

  return (
    <li onClick={onClick}>
      {city.name}, {city.country.code}
    </li>
  );
};

export default SearchResult;
