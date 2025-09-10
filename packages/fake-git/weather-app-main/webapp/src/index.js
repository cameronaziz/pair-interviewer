// Initialize ApolloClient
// See: https://www.apollographql.com/docs/tutorial/queries/#integrate-with-react
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { RoutingContextProvider } from './context/routing';
import { UIContextProvider } from './context/ui';
import generatedIntrospection from './graphql/fragments.json';
import reportWebVitals from './reportWebVitals';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache({
    possibleTypes: generatedIntrospection.possibleTypes,
  } ),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <RoutingContextProvider>
      <UIContextProvider>
        <App />
      </UIContextProvider>
    </RoutingContextProvider>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
