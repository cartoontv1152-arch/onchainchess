import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
  from,
  ApolloLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
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
    console.log('🔍 Custom fetch called for:', uri);
    const response = await fetch(uri, options);
    
    // Clone the response so we can read it without consuming it
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();
    console.log('🔍 Raw response text:', text.substring(0, 100));
    
    // Check if response is a transaction hash (hex string, 64 chars)
    const trimmedText = text.trim();
    const isTransactionHash = /^[0-9a-f]{64}$/i.test(trimmedText);
    
    // Also check if it's JSON with a string data field containing a hash
    let jsonData = null;
    let hashFromJson = null;
    try {
      jsonData = JSON.parse(trimmedText);
      if (jsonData && typeof jsonData === 'object' && typeof jsonData.data === 'string') {
        hashFromJson = jsonData.data;
        if (/^[0-9a-f]{64}$/i.test(hashFromJson)) {
          console.log('🔍 Found transaction hash in JSON data field:', hashFromJson);
        }
      }
    } catch (e) {
      // Not JSON, that's fine
    }
    
    if (isTransactionHash || hashFromJson) {
      const hash = hashFromJson || trimmedText;
      
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
        console.warn('Could not parse request body:', e);
      }
      
      console.log(`🔄 Transforming transaction hash response for ${operationName}:`, hash);
      
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
          data: hash
        };
      }
      
      console.log('✅ Returning transformed GraphQL response:', graphqlResponse);
      
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
    console.log('ℹ️ Response is not a transaction hash, returning as-is');
    return response;
  };

  const httpLink = new HttpLink({
    uri: httpUrl,
    fetch: customFetch,
  });

  // Apollo Link to transform responses after fetch but before cache
  const responseTransformLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      // Ensure errors is always an array
      const errors = Array.isArray(response.errors) 
        ? response.errors 
        : (response.errors ? [response.errors] : []);
      
      // Check if data is a string (transaction hash)
      if (response && typeof response.data === 'string') {
        const hash = response.data;
        const operationName = operation.operationName;
        console.log(`🔄 Apollo Link: Transforming string data for ${operationName}:`, hash);
        
        let transformedData = null;
        if (operationName === 'CreateGame') {
          transformedData = {
            createGame: {
              success: true,
              message: "Game creation scheduled",
              gameId: null
            }
          };
        } else if (operationName === 'JoinGame') {
          transformedData = {
            joinGame: {
              success: true,
              message: "Join game scheduled"
            }
          };
        } else if (operationName === 'MakeMove') {
          transformedData = {
            makeMove: {
              success: true,
              message: "Move scheduled"
            }
          };
        } else if (operationName === 'ResignGame') {
          transformedData = {
            resignGame: {
              success: true,
              message: "Resignation scheduled"
            }
          };
        }
        
        if (transformedData) {
          return {
            ...response,
            data: transformedData,
            errors: [],
            extensions: response.extensions || {},
          };
        }
      }
      
      // Ensure errors is an array for all responses
      return {
        ...response,
        errors: errors,
      };
    });
  });

  const httpLinkWithTransform = from([responseTransformLink, httpLink]);

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLinkWithTransform
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
        fetchPolicy: 'no-cache',
      }
    },
  });
}

function GraphQLProvider({ chainId, applicationId, port, host = 'localhost', children }) {
  let client = apolloClient(chainId, applicationId, port, host);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

export default GraphQLProvider;
