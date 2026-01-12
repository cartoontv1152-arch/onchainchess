import React from 'react';
import { useAvailableGames, usePlayerGames, useJoinGame } from '../services/chessOperations';
import { formatAddress, formatGameStatus } from '../utils/chessUtils';

const GameList = ({ player, onJoinGame, onSelectGame }) => {
  const { games: availableGames, loading: availableLoading, refetch: refetchAvailable } = useAvailableGames();
  const { games: playerGames, loading: playerLoading, refetch: refetchPlayer } = usePlayerGames(player);
  const { joinGame, loading: joinLoading } = useJoinGame();

  const handleJoinGame = async (gameId) => {
    try {
      const result = await joinGame(gameId, player);
      if (result.data?.joinGame?.success) {
        if (onJoinGame) {
          onJoinGame(gameId);
        }
        refetchAvailable();
        refetchPlayer();
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleSelectGame = (gameId) => {
    if (onSelectGame) {
      onSelectGame(gameId);
    }
  };

  return (
    <div className="game-list-container">
      <div className="game-list-section">
        <h3 className="game-list-title">Available Games</h3>
        {availableLoading ? (
          <div className="loading">Loading available games...</div>
        ) : availableGames.length === 0 ? (
          <div className="empty-state">No available games. Create one to get started!</div>
        ) : (
          <div className="game-list">
            {availableGames.map((game) => (
              <div key={game.gameId} className="game-item">
                <div className="game-info">
                  <div className="game-id">Game #{game.gameId}</div>
                  <div className="game-creator">White: {formatAddress(game.whitePlayer)}</div>
                  <div className="game-status">{formatGameStatus(game.status)}</div>
                  <div className="game-time">
                    Created: {new Date(game.createdAt / 1000).toLocaleString()}
                  </div>
                </div>
                {game.status === 'WaitingForPlayer' && game.whitePlayer !== player && (
                  <button
                    className="join-button"
                    onClick={() => handleJoinGame(game.gameId)}
                    disabled={joinLoading}
                  >
                    {joinLoading ? 'Joining...' : 'Join Game'}
                  </button>
                )}
                {game.whitePlayer === player || game.blackPlayer === player ? (
                  <button
                    className="view-button"
                    onClick={() => handleSelectGame(game.gameId)}
                  >
                    View Game
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="game-list-section">
        <h3 className="game-list-title">Your Games</h3>
        {playerLoading ? (
          <div className="loading">Loading your games...</div>
        ) : playerGames.length === 0 ? (
          <div className="empty-state">You haven't joined any games yet.</div>
        ) : (
          <div className="game-list">
            {playerGames.map((game) => (
              <div key={game.gameId} className="game-item">
                <div className="game-info">
                  <div className="game-id">Game #{game.gameId}</div>
                  <div className="game-players">
                    <div>White: {formatAddress(game.whitePlayer)}</div>
                    <div>Black: {game.blackPlayer ? formatAddress(game.blackPlayer) : 'Waiting...'}</div>
                  </div>
                  <div className="game-status">{formatGameStatus(game.status)}</div>
                  <div className="game-time">
                    Last move: {new Date(game.lastMoveAt / 1000).toLocaleString()}
                  </div>
                </div>
                <button
                  className="view-button"
                  onClick={() => handleSelectGame(game.gameId)}
                >
                  View Game
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameList;
