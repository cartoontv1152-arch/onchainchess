import React, { useState, useEffect } from 'react';
import { useWallet, WalletConnector } from './providers';
import { useGame, useCreateGame, useMakeMove, useResignGame, useAvailableGames, usePlayerGames } from './services/chessOperations';
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
  const { refetch: refetchAvailableGames } = useAvailableGames();
  const { refetch: refetchPlayerGames } = usePlayerGames(account);

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
      console.log('🎮 Creating game with account:', account);
      console.log('📋 Account type:', typeof account, 'Length:', account?.length);
      
      const result = await createGame(account);
      console.log('📦 Create game result:', result);
      console.log('📦 Result data:', result.data);
      console.log('📦 Result errors:', result.errors);
      
      // Handle case where result.data might be a string (transaction hash) instead of object
      let createGameData = result.data;
      if (typeof result.data === 'string') {
        console.warn('⚠️ Received string response instead of GraphQL object:', result.data);
        // This might be a transaction hash - the operation was scheduled
        createGameData = {
          createGame: {
            success: true,
            message: "Game creation scheduled",
            gameId: null
          }
        };
      }
      
      if (createGameData?.createGame?.success || result.data?.createGame?.success) {
        const gameResponse = createGameData?.createGame || result.data?.createGame;
        showMessage('Game creation scheduled! Processing operation...', 'success');
        const gameId = gameResponse?.gameId;
        
        if (gameId) {
          setSelectedGameId(gameId);
          showMessage('Game created successfully!', 'success');
        } else {
          // Operation was scheduled but gameId not returned yet
          // Operations are async - they need to be processed by the contract
          showMessage('Game creation scheduled. Waiting for operation to process...', 'info');
          
          // Poll for new games - operations need time to be processed
          let pollCount = 0;
          const maxPolls = 30; // Poll for up to 60 seconds (30 * 2s)
          
          const pollInterval = setInterval(async () => {
            pollCount++;
            console.log(`🔄 Polling for new game (attempt ${pollCount}/${maxPolls})...`);
            
            try {
              // Check both available games and player games
              let newGame = null;
              
              // First check player games (more reliable - game is added to player's list immediately)
              if (refetchPlayerGames && account) {
                const { data: playerData } = await refetchPlayerGames();
                const playerGames = playerData?.getPlayerGames || [];
                console.log(`📊 Found ${playerGames.length} player games`);
                
                // Find the most recent game created by this account (waiting for player)
                const recentGames = playerGames
                  .filter(g => g.whitePlayer === account && !g.blackPlayer && g.status === 'WaitingForPlayer')
                  .sort((a, b) => (b.gameId || 0) - (a.gameId || 0));
                
                if (recentGames.length > 0) {
                  newGame = recentGames[0];
                  console.log('✅ New game found in player games!', newGame);
                }
              }
              
              // Also check available games as fallback
              if (!newGame && refetchAvailableGames) {
                const { data: availableData } = await refetchAvailableGames();
                const availableGames = availableData?.getAvailableGames || [];
                console.log(`📊 Found ${availableGames.length} available games`);
                
                newGame = availableGames.find(g => g.whitePlayer === account && !g.blackPlayer);
                if (newGame) {
                  console.log('✅ New game found in available games!', newGame);
                }
              }
              
              if (newGame) {
                clearInterval(pollInterval);
                setSelectedGameId(newGame.gameId);
                showMessage('Game created and confirmed!', 'success');
                return;
              }
              
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showMessage('Operation may still be processing. Check the game list or try again.', 'warning');
                console.warn('⚠️ Game creation polling timed out');
              }
            } catch (error) {
              console.error('❌ Error polling for game:', error);
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
              }
            }
          }, 2000);
        }
      } else {
        // Check if we got a string response (transaction hash) - treat as success
        if (typeof result.data === 'string') {
          console.log('✅ Received transaction hash, treating as success:', result.data);
          showMessage('Game creation scheduled! Processing operation...', 'success');
          // Start polling for the new game
          let pollCount = 0;
          const maxPolls = 30; // Poll for up to 60 seconds (30 * 2s)
          const pollInterval = setInterval(async () => {
            pollCount++;
            console.log(`🔄 Polling for new game (attempt ${pollCount}/${maxPolls})...`);
            try {
              // Check both available games and player games
              let newGame = null;
              
              // First check player games (more reliable - game is added to player's list immediately)
              if (refetchPlayerGames && account) {
                const { data: playerData } = await refetchPlayerGames();
                const playerGames = playerData?.getPlayerGames || [];
                console.log(`📊 Found ${playerGames.length} player games`);
                
                // Find the most recent game created by this account (waiting for player)
                const recentGames = playerGames
                  .filter(g => g.whitePlayer === account && !g.blackPlayer && g.status === 'WaitingForPlayer')
                  .sort((a, b) => (b.gameId || 0) - (a.gameId || 0));
                
                if (recentGames.length > 0) {
                  newGame = recentGames[0];
                  console.log('✅ New game found in player games!', newGame);
                }
              }
              
              // Also check available games as fallback
              if (!newGame && refetchAvailableGames) {
                const { data: availableData } = await refetchAvailableGames();
                const availableGames = availableData?.getAvailableGames || [];
                console.log(`📊 Found ${availableGames.length} available games`);
                
                newGame = availableGames.find(g => g.whitePlayer === account && !g.blackPlayer);
                if (newGame) {
                  console.log('✅ New game found in available games!', newGame);
                }
              }
              
              if (newGame) {
                clearInterval(pollInterval);
                setSelectedGameId(newGame.gameId);
                showMessage('Game created and confirmed!', 'success');
                return;
              }
              
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
                showMessage('Operation may still be processing. Check the game list or try again.', 'warning');
              }
            } catch (error) {
              console.error('❌ Error polling for game:', error);
              if (pollCount >= maxPolls) {
                clearInterval(pollInterval);
              }
            }
          }, 2000);
        } else {
          const errorMsg = result.data?.createGame?.message || 
                          result.errors?.[0]?.message || 
                          'Failed to create game';
          console.error('❌ Create game failed:', errorMsg, result);
          showMessage(errorMsg, 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error creating game:', error);
      const errorMsg = error.message || error.toString() || 'Unknown error';
      showMessage('Error creating game: ' + errorMsg, 'error');
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
