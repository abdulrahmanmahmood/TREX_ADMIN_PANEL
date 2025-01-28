"use client";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { PropsWithChildren } from "react";
import { getCookie } from "cookies-next";
import { ApolloLink } from "@apollo/client/link/core";

const httpLink = createHttpLink({
  uri: "https://admin-server.yallal3b.com/graphql", // Your GraphQL endpoint
});

// Function to recursively remove __typename
const removeTypename = (key: string, value: any) => {
  return key === "__typename" ? undefined : value;
};

// Custom middleware to strip __typename
const removeTypenameLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    if (response?.data) {
      response.data = JSON.parse(JSON.stringify(response.data), removeTypename);
    }
    return response;
  });
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      accept: "*/*",
      "content-type": "application/json",
    },
  };
});

export const client = new ApolloClient({
  link: ApolloLink.from([removeTypenameLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache({
    addTypename: false, // Prevent adding __typename globally
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
  },
});

export function ApolloWrapper({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
