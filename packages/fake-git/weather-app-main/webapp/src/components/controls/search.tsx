import { useLazyQuery } from '@apollo/client';
import { useCallback, useEffect, useState, VFC } from 'react';
import CITIES from '../../graphql/queries/citiesPart';
import debounce from '../../utils/debounce';
import Input from '../input';
import SearchResult from './searchResult';

const Search: VFC = () => {
  const [value, setValue] = useState('');
  const [cities, setCities] = useState<GraphQL.CityPart[]>([]);
  const [search, { data, loading }] = useLazyQuery<GraphQL.Query.CitiesPart, GraphQL.Query.CitiesPartArgs>(CITIES);

  const request = (value: string) => {
    search({ variables: { name: value } });
  };

  const debouncedRequest = useCallback(
    debounce(request, 500)
    , []);

  useEffect(
    () => {
      if (value.length === 0) {
        setCities([]);
      }
      if (value) {
        debouncedRequest(value);
      }
    },
    [value],
  );

  useEffect(
    () => {
      if (value) {
        const { Cities } = data || {};
        setCities(Cities || []);
      }
    },
    [data, value],
  );

  const selectResult = () => {
    setValue('');
    setCities([]);
  }

  return (
    <div className="search-container">
      <Input
        label="Search for City"
        handleChange={setValue}
        isLoading={loading}
      />
      {cities.length > 0 &&
        <ul className="search-results">
          {cities.map((city) =>
            <SearchResult
              key={city.id}
              city={city}
              selectResult={selectResult}
            />
          )}
        </ul>
      }
    </div>
  );
};

export default Search;
