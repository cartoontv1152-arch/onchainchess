import { useQuery, useMutation, gql } from '@apollo/client';

// Queries
export const GET_GAME = gql`
  query GetGame($gameId: UInt64!) {
    getGame(gameId: $gameId) {
      gameId
      whitePlayer
      blackPlayer
      currentTurn
      status
      board
      moveHistory {
        from {
          file
          rank
        }
        to {
          file
          rank
        }
        promotion
      }
      createdAt
      lastMoveAt
    }
  }
`;

export const GET_PLAYER_GAMES = gql`
  query GetPlayerGames($player: AccountOwner!) {
    getPlayerGames(player: $player) {
      gameId
      whitePlayer
      blackPlayer
      currentTurn
      status
      board
      moveHistory {
        from {
          file
          rank
        }
        to {
          file
          rank
        }
        promotion
      }
      createdAt
      lastMoveAt
    }
  }
`;

export const GET_AVAILABLE_GAMES = gql`
  query GetAvailableGames {
    getAvailableGames {
      gameId
      whitePlayer
      blackPlayer
      currentTurn
      status
      board
      moveHistory {
        from {
          file
          rank
        }
        to {
          file
          rank
        }
        promotion
      }
      createdAt
      lastMoveAt
    }
  }
`;

// Mutations
export const CREATE_GAME = gql`
  mutation CreateGame($creator: AccountOwner!) {
    createGame(creator: $creator) {
      success
      message
      gameId
    }
  }
`;

export const JOIN_GAME = gql`
  mutation JoinGame($gameId: UInt64!, $player: AccountOwner!) {
    joinGame(gameId: $gameId, player: $player) {
      success
      message
    }
  }
`;

export const MAKE_MOVE = gql`
  mutation MakeMove(
    $gameId: UInt64!
    $player: AccountOwner!
    $chessMove: ChessMoveInput!
  ) {
    makeMove(gameId: $gameId, player: $player, chessMove: $chessMove) {
      success
      message
    }
  }
`;

export const RESIGN_GAME = gql`
  mutation ResignGame($gameId: UInt64!, $player: AccountOwner!) {
    resignGame(gameId: $gameId, player: $player) {
      success
      message
    }
  }
`;

export const END_GAME = gql`
  mutation EndGame($gameId: UInt64!, $status: GameStatus!) {
    endGame(gameId: $gameId, status: $status) {
      success
      message
    }
  }
`;

// Hooks
export const useGame = (gameId) => {
  const { data, loading, error, refetch } = useQuery(GET_GAME, {
    variables: { gameId },
    skip: !gameId,
    pollInterval: 2000, // Poll every 2 seconds
  });

  return {
    game: data?.getGame,
    loading,
    error,
    refetch,
  };
};

export const usePlayerGames = (player) => {
  const { data, loading, error, refetch } = useQuery(GET_PLAYER_GAMES, {
    variables: { player },
    skip: !player,
    pollInterval: 3000,
  });

  return {
    games: data?.getPlayerGames || [],
    loading,
    error,
    refetch,
  };
};

export const useAvailableGames = () => {
  const { data, loading, error, refetch } = useQuery(GET_AVAILABLE_GAMES, {
    pollInterval: 2000,
  });

  return {
    games: data?.getAvailableGames || [],
    loading,
    error,
    refetch,
  };
};

export const useCreateGame = () => {
  const [createGame, { loading, error }] = useMutation(CREATE_GAME);

  return {
    createGame: (creator) => createGame({ variables: { creator } }),
    loading,
    error,
  };
};

export const useJoinGame = () => {
  const [joinGame, { loading, error }] = useMutation(JOIN_GAME);

  return {
    joinGame: (gameId, player) => joinGame({ variables: { gameId, player } }),
    loading,
    error,
  };
};

export const useMakeMove = () => {
  const [makeMove, { loading, error }] = useMutation(MAKE_MOVE);

  return {
    makeMove: (gameId, player, chessMove) =>
      makeMove({ variables: { gameId, player, chessMove } }),
    loading,
    error,
  };
};

export const useResignGame = () => {
  const [resignGame, { loading, error }] = useMutation(RESIGN_GAME);

  return {
    resignGame: (gameId, player) =>
      resignGame({ variables: { gameId, player } }),
    loading,
    error,
  };
};

export const useEndGame = () => {
  const [endGame, { loading, error }] = useMutation(END_GAME);

  return {
    endGame: (gameId, status) =>
      endGame({ variables: { gameId, status } }),
    loading,
    error,
  };
};

export default {
  useGame,
  usePlayerGames,
  useAvailableGames,
  useCreateGame,
  useJoinGame,
  useMakeMove,
  useResignGame,
  useEndGame,
};
