import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import React from "react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

function apolloClient(chainId, applicationId, port, host = 'localhost') {
  const isValidChainId = (chainId) => {
    if (!chainId) return false;
    return /^[0-9a-fA-F]{64}$/.test(chainId);
  };
  
  if (!isValidChainId(chainId)) {
    console.warn('Invalid chainId format, skipping GraphQL connection setup');
    return new ApolloClient({
      link: new HttpLink({ uri: '/invalid-chain' }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { errorPolicy: 'all', fetchPolicy: 'no-cache' },
        query: { errorPolicy: 'all', fetchPolicy: 'no-cache' },
        mutate: { errorPolicy: 'ignore' }
      }
    });
  }

  const normalizedHost = host.replace(/^\s*https?:\/\//, '');
  const httpBase = `http://${normalizedHost}:${port}`;
  const wsBase = `ws://${normalizedHost}:${port}`;
  const wsUrl = `${wsBase}/ws`;
  const httpUrl = `${httpBase}/chains/${chainId}/applications/${applicationId}`;
  
  const wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
      connectionParams: () => ({
        chainId: chainId,
        applicationId: applicationId
      }),
      shouldRetry: () => true,
      retryAttempts: 10, 
      retryWait: async (retries) => {
        const delay = Math.min(500 * Math.pow(1.2, retries), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
      },
      keepAlive: 5000,
      on: {
        connecting: () => {
          console.log('GraphQL WebSocket connecting...');
        },
        connected: () => {
          console.log('GraphQL WebSocket connected');
        },
        error: (error) => {
          console.error('GraphQL WebSocket error:', error);
        },
        closed: (event) => {
          console.log('GraphQL WebSocket closed:', event);
        }
      }
    })
  );

  // Custom fetch function to intercept and transform non-GraphQL responses
  const customFetch = async (uri, options) => {
    const response = await fetch(uri, options);
    
    // Clone the response so we can read it without consuming it
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();
    
    // Check if response is a transaction hash (hex string, 64 chars)
    const isTransactionHash = /^[0-9a-f]{64}$/i.test(text.trim());
    
    if (isTransactionHash) {
      // Parse the GraphQL operation from the request body
      let operationName = 'Unknown';
      try {
        const body = JSON.parse(options.body);
        if (body.query) {
          // Extract operation name from query
          const match = body.query.match(/(?:mutation|query)\s+(\w+)/);
          if (match) {
            operationName = match[1];
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      console.log(`🔄 Transforming transaction hash response for ${operationName}:`, text.trim());
      
      // Create a proper GraphQL response
      let graphqlResponse;
      if (operationName === 'CreateGame') {
        graphqlResponse = {
          data: {
            createGame: {
              success: true,
              message: "Game creation scheduled",
              gameId: null
            }
          }
        };
      } else if (operationName === 'JoinGame') {
        graphqlResponse = {
          data: {
            joinGame: {
              success: true,
              message: "Join game scheduled"
            }
          }
        };
      } else if (operationName === 'MakeMove') {
        graphqlResponse = {
          data: {
            makeMove: {
              success: true,
              message: "Move scheduled"
            }
          }
        };
      } else if (operationName === 'ResignGame') {
        graphqlResponse = {
          data: {
            resignGame: {
              success: true,
              message: "Resignation scheduled"
            }
          }
        };
      } else {
        // Unknown operation, return as-is but wrapped
        graphqlResponse = {
          data: text.trim()
        };
      }
      
      // Return a new Response with the transformed JSON
      return new Response(JSON.stringify(graphqlResponse), {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Not a transaction hash, return original response
    return response;
  };

  const httpLink = new HttpLink({
    uri: httpUrl,
    fetch: customFetch,
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );
  
  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getGame: {
              merge: false,
            },
            getPlayerGames: {
              merge: false,
            },
            getAvailableGames: {
              merge: false,
            }
          }
        }
      }
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: false, 
        fetchPolicy: 'cache-first',
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      },
      mutate: {
        errorPolicy: 'all',
      }
    },
  });
}

function GraphQLProvider({ chainId, applicationId, port, host = 'localhost', children }) {
  let client = apolloClient(chainId, applicationId, port, host);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default GraphQLProvider;
