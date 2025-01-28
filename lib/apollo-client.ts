import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://admin-server.yallal3b.com/graphql",
  cache: new InMemoryCache(),
});

export default client;
