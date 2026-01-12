import React, { useState, useEffect } from 'react';
import { useWallet, WalletConnector } from './providers';
import { useGame, useCreateGame, useMakeMove, useResignGame } from './services/chessOperations';
import ChessBoard from './components/ChessBoard';
import GameList from './components/GameList';
import MoveHistory from './components/MoveHistory';
import WalletSelector from './components/WalletSelector';
import { formatAddress, formatGameStatus } from './utils/chessUtils';
import './App.css';

function App({ chainId, appId, ownerId }) {
  const { account, isConnected, connectWallet } = useWallet();
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const { game, loading: gameLoading, refetch: refetchGame } = useGame(selectedGameId);
  const { createGame, loading: createLoading } = useCreateGame();
  const { makeMove, loading: moveLoading } = useMakeMove();
  const { resignGame, loading: resignLoading } = useResignGame();

  useEffect(() => {
    if (selectedGameId && refetchGame) {
      const interval = setInterval(() => {
        refetchGame();
      }, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [selectedGameId, refetchGame]);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 5000);
  };

  const handleCreateGame = async () => {
    if (!account || !isConnected) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    try {
      const result = await createGame(account);
      if (result.data?.createGame?.success) {
        showMessage('Game created successfully!', 'success');
        const gameId = result.data.createGame.gameId;
        if (gameId) {
          setSelectedGameId(gameId);
        } else {
          // Poll for new game
          setTimeout(() => {
            refetchGame();
          }, 2000);
        }
      } else {
        showMessage(result.data?.createGame?.message || 'Failed to create game', 'error');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      showMessage('Error creating game: ' + error.message, 'error');
    }
  };

  const handleMakeMove = async (chessMove) => {
    if (!account || !game || !selectedGameId) return;

    try {
      const result = await makeMove(selectedGameId, account, chessMove);
      if (result.data?.makeMove?.success) {
        showMessage('Move made successfully!', 'success');
        setTimeout(() => {
          refetchGame();
        }, 1000);
      } else {
        showMessage(result.data?.makeMove?.message || 'Failed to make move', 'error');
      }
    } catch (error) {
      console.error('Error making move:', error);
      showMessage('Error making move: ' + error.message, 'error');
    }
  };

  const handleResignGame = async () => {
    if (!account || !game || !selectedGameId) return;

    if (!window.confirm('Are you sure you want to resign this game?')) {
      return;
    }

    try {
      const result = await resignGame(selectedGameId, account);
      if (result.data?.resignGame?.success) {
        showMessage('Game resigned', 'success');
        setTimeout(() => {
          refetchGame();
        }, 1000);
      } else {
        showMessage(result.data?.resignGame?.message || 'Failed to resign game', 'error');
      }
    } catch (error) {
      console.error('Error resigning game:', error);
      showMessage('Error resigning game: ' + error.message, 'error');
    }
  };

  const handleJoinGame = (gameId) => {
    setSelectedGameId(gameId);
    showMessage('Game joined! Loading game...', 'success');
  };

  const handleSelectGame = (gameId) => {
    setSelectedGameId(gameId);
  };

  const getPlayerColor = () => {
    if (!game || !account) return null;
    if (game.whitePlayer === account) return 'White';
    if (game.blackPlayer === account) return 'Black';
    return null;
  };

  const isPlayerTurn = () => {
    if (!game || !account) return false;
    const playerColor = getPlayerColor();
    if (!playerColor) return false;
    return game.currentTurn === playerColor;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title-section">
          <h1 className="app-title">♟️ OnChain Chess</h1>
          <p className="app-subtitle">Decentralized Chess on Linera Blockchain</p>
        </div>
        <div className="app-header-actions">
          <WalletConnector setMessage={showMessage} />
        </div>
      </header>

      {message && (
        <div className={`message-banner ${messageType}`}>
          <span>{message}</span>
          <button onClick={() => { setMessage(null); setMessageType(null); }}>×</button>
        </div>
      )}

      <main className="main-content">
        {!isConnected ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <h2>Welcome to OnChain Chess!</h2>
              <p>Connect your wallet to start playing chess on the blockchain.</p>
              <div className="wallet-setup-section">
                <WalletSelector
                  onWalletConnected={(address, walletType) => {
                    console.log('Wallet connected:', address, walletType);
                    showMessage(`Wallet connected: ${formatAddress(address)}`, 'success');
                    // The WalletProvider will handle the connection
                    // Try to connect via WalletProvider
                    setTimeout(() => {
                      if (connectWallet) {
                        connectWallet();
                      }
                    }, 500);
                  }}
                  onWalletDisconnected={() => {
                    console.log('Wallet disconnected');
                    showMessage('Wallet disconnected', 'info');
                  }}
                />
                <div className="wallet-help">
                  <p><strong>💡 Tip:</strong> Linera Web Client requires no installation - just click "Connect Web Client"!</p>
                  <p>For detailed wallet setup, see <code>WALLET_SETUP_GUIDE.md</code></p>
                </div>
              </div>
            </div>
          </div>
        ) : !selectedGameId ? (
          <div className="game-selector">
            <div className="game-selector-header">
              <h2>Select or Create a Game</h2>
              <button
                className="create-game-button"
                onClick={handleCreateGame}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : '+ Create New Game'}
              </button>
            </div>
            <GameList
              player={account}
              onJoinGame={handleJoinGame}
              onSelectGame={handleSelectGame}
            />
          </div>
        ) : (
          <div className="game-container">
            {gameLoading ? (
              <div className="loading">Loading game...</div>
            ) : !game ? (
              <div className="error">Game not found</div>
            ) : (
              <>
                <div className="game-header">
                  <button
                    className="back-button"
                    onClick={() => setSelectedGameId(null)}
                  >
                    ← Back to Games
                  </button>
                  <div className="game-info">
                    <h3>Game #{game.gameId}</h3>
                    <div className="game-players">
                      <div className={`player white ${game.whitePlayer === account ? 'you' : ''}`}>
                        <span className="player-label">White:</span>
                        <span className="player-address">{formatAddress(game.whitePlayer)}</span>
                      </div>
                      <div className={`player black ${game.blackPlayer === account ? 'you' : ''}`}>
                        <span className="player-label">Black:</span>
                        <span className="player-address">
                          {game.blackPlayer ? formatAddress(game.blackPlayer) : 'Waiting for player...'}
                        </span>
                      </div>
                    </div>
                    <div className="game-status">
                      Status: <span className={`status ${game.status}`}>{formatGameStatus(game.status)}</span>
                    </div>
                  </div>
                  {game.status === 'InProgress' && (
                    <div className="game-actions">
                      <button
                        className="resign-button"
                        onClick={handleResignGame}
                        disabled={resignLoading}
                      >
                        {resignLoading ? 'Resigning...' : 'Resign'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="game-board-section">
                  <div className="chess-board-wrapper">
                    <ChessBoard
                      game={game}
                      player={account}
                      onMove={handleMakeMove}
                      isLoading={moveLoading}
                    />
                  </div>
                  <div className="game-sidebar">
                    <MoveHistory moveHistory={game.moveHistory} />
                    {game.status === 'InProgress' && (
                      <div className="turn-indicator">
                        <div className={`turn ${isPlayerTurn() ? 'your-turn' : 'opponent-turn'}`}>
                          {isPlayerTurn() ? '✅ Your turn' : '⏳ Opponent\'s turn'}
                        </div>
                        <div className="current-player">
                          Current turn: {game.currentTurn}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for Linera Real-Time Markets Wavehack</p>
        <p>Powered by Linera Blockchain</p>
      </footer>
    </div>
  );
}

export default App;
