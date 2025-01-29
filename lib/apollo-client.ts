// apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getCookie } from 'cookies-next';

const httpLink = createHttpLink({
  uri: 'YOUR_GRAPHQL_ENDPOINT',
});

const authLink = setContext((_, { headers }) => {
  const token = getCookie('token');
  
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});