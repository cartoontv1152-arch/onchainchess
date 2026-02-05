import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { squareToAlgebraic, algebraicToSquare } from '../utils/chessUtils';

const ChessBoard = ({ game, playerColor, onMove, isPlayerTurn }) => {
  const [gameState, setGameState] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  // Reconstruct board state from on-chain move history
  // chess.js is used ONLY for UI rendering - validation happens on-chain
  useEffect(() => {
    if (!game) {
      setGameState(new Chess());
      return;
    }

    const chess = new Chess();
    
    // Reconstruct from on-chain move history
    if (game.moveHistory && game.moveHistory.length > 0) {
      try {
        game.moveHistory.forEach((moveRecord) => {
          if (!moveRecord.chessMove || !moveRecord.chessMove.from || !moveRecord.chessMove.to) return;
          
          const fromSquare = squareToAlgebraic(moveRecord.chessMove.from);
          const toSquare = squareToAlgebraic(moveRecord.chessMove.to);
          
          if (!fromSquare || !toSquare) return;
          
          // Build move object for chess.js (UI only)
          const moveObj = {
            from: fromSquare,
            to: toSquare,
            promotion: moveRecord.chessMove.promotion 
              ? moveRecord.chessMove.promotion.toLowerCase().charAt(0) 
              : undefined,
          };
          
          const result = chess.move(moveObj);
          if (!result) {
            console.warn('Failed to apply move in UI:', moveObj);
          }
        });
      } catch (error) {
        console.error('Error applying move history:', error);
        // Fallback to FEN if available
        if (game.board) {
          try {
            const chessFromFen = new Chess(game.board);
            setGameState(chessFromFen);
            return;
          } catch (fenError) {
            console.error('Error loading from FEN:', fenError);
          }
        }
      }
    } else if (game.board) {
      // If no moves but FEN exists, use FEN
      try {
        const chessFromFen = new Chess(game.board);
        setGameState(chessFromFen);
        return;
      } catch (fenError) {
        console.error('Error loading from FEN:', fenError);
      }
    }
    
    setGameState(chess);
  }, [game?.moveHistory, game?.board, game?.matchId]);

  const canMakeMove = () => {
    if (!game) {
      console.log("canMakeMove: no game");
      return false;
    }
    // Check status - it might be 'Active' or 'ACTIVE' or MatchStatus enum
    const status = String(game.status).toUpperCase();
    const isActive = status === 'ACTIVE' || status === 'INPROGRESS' || status === 'IN_PROGRESS';
    if (!isActive) {
      console.log("canMakeMove: game not active, status:", status);
      return false;
    }
    if (!isPlayerTurn) {
      console.log("canMakeMove: not player's turn, isPlayerTurn:", isPlayerTurn);
      return false;
    }
    console.log("canMakeMove: true - can make move");
    return true;
  };

  const onSquareClick = (square) => {
    console.log("onSquareClick called:", square, "canMakeMove:", canMakeMove(), "isPlayerTurn:", isPlayerTurn);
    if (!canMakeMove()) {
      console.log("Cannot make move - returning early");
      return;
    }

    // If no square is selected, select this square
    if (!moveFrom) {
      const piece = gameState.get(square);
      // Check if piece belongs to player (UI only - for highlighting)
      const pieceColor = piece?.color === 'w' ? 'White' : 'Black';
      if (piece && pieceColor === playerColor) {
        setMoveFrom(square);
        // Get possible moves for UI highlighting (chess.js for UI only)
        const moves = gameState.moves({ square, verbose: true });
        setPossibleMoves(moves.map(m => m.to));
      }
      return;
    }

    // If same square clicked, deselect
    if (moveFrom === square) {
      setMoveFrom(null);
      setPossibleMoves([]);
      return;
    }

    const fromSquare = algebraicToSquare(moveFrom);
    const toSquare = algebraicToSquare(square);
    
    if (!fromSquare || !toSquare) {
      console.error("Invalid square conversion");
      setMoveFrom(null);
      setPossibleMoves([]);
      return;
    }

    // Check if this is a promotion move (pawn reaching last rank)
    let promotion = null;
    const piece = gameState.get(moveFrom);
    if (piece && piece.type === 'p') {
      const targetRank = toSquare.rank;
      if (targetRank === 0 || targetRank === 7) {
        // Pawn promotion - default to Queen (user can change later if needed)
        promotion = 'Queen';
      }
    }

    // Format move and send to chain - WASM validates on-chain
    const chessMove = {
      from: fromSquare,
      to: toSquare,
      promotion: promotion,
    };

    // Send to chain - contract validates on-chain
    console.log("Sending move to chain:", chessMove);
    if (onMove) {
      onMove(chessMove).catch((error) => {
        console.error("Move failed:", error);
        // Reset board state on error
        setGameState(new Chess(gameState.fen()));
      });
    } else {
      console.error("onMove handler is not provided!");
    }

    // Reset selection
    setMoveFrom(null);
    setPossibleMoves([]);
  };

  const onPieceDrop = (sourceSquare, targetSquare) => {
    console.log("onPieceDrop called:", sourceSquare, "->", targetSquare, "canMakeMove:", canMakeMove());
    if (!canMakeMove()) {
      console.log("Cannot make move - returning false");
      return false;
    }

    const fromSquare = algebraicToSquare(sourceSquare);
    const toSquare = algebraicToSquare(targetSquare);
    
    if (!fromSquare || !toSquare) {
      console.error("Invalid square conversion");
      return false;
    }

    // Check if this is a promotion move (pawn reaching last rank)
    let promotion = null;
    const piece = gameState.get(sourceSquare);
    if (piece && piece.type === 'p') {
      const targetRank = toSquare.rank;
      if (targetRank === 0 || targetRank === 7) {
        // Pawn promotion - default to Queen (user can change later if needed)
        promotion = 'Queen';
      }
    }

    // Format move and send to chain - WASM validates on-chain
    const chessMove = {
      from: fromSquare,
      to: toSquare,
      promotion: promotion,
    };

    // Send to chain - contract validates on-chain
    console.log("Sending move to chain:", chessMove);
    if (onMove) {
      onMove(chessMove).catch((error) => {
        console.error("Move failed:", error);
        // Reset board state on error
        setGameState(new Chess(gameState.fen()));
      });
    } else {
      console.error("onMove handler is not provided!");
    }

    setMoveFrom(null);
    setPossibleMoves([]);
    return true; // Allow drop - validation happens on-chain
  };

  const getCustomSquareStyles = () => {
    const styles = {};
    
    // Highlight selected square
    if (moveFrom) {
      styles[moveFrom] = {
        background: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Highlight possible move squares (UI only)
    possibleMoves.forEach((square) => {
      styles[square] = {
        background: 'rgba(0, 255, 0, 0.4)',
      };
    });

    return styles;
  };

  const getBoardOrientation = () => {
    if (!playerColor) return 'white';
    return playerColor === 'White' ? 'white' : 'black';
  };

  const formatGameStatus = (status) => {
    const statusMap = {
      WaitingForPlayer: 'Waiting for player',
      Active: 'In progress',
      Ended: 'Game ended',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="chess-board-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="chess-board-wrapper" style={{ width: '100%', maxWidth: '800px' }}>
        <Chessboard
          position={gameState.fen()}
          onSquareClick={onSquareClick}
          onPieceDrop={onPieceDrop}
          customSquareStyles={getCustomSquareStyles()}
          boardOrientation={getBoardOrientation()}
          arePiecesDraggable={true}
          boardWidth={800}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            cursor: canMakeMove() ? 'pointer' : 'not-allowed',
          }}
          customDropSquareStyle={{
            boxShadow: 'inset 0 0 1px 4px rgba(255,255,0,.4)',
          }}
        />
      </div>
      <div className="turn-indicator" style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: canMakeMove() ? '#4CAF50' : '#f44336',
        color: 'white',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {canMakeMove() ? '✅ Your turn - Click or drag pieces to move' : 
         game?.status === 'Active' ? '⏳ Waiting for opponent...' : 
         `Game Status: ${game?.status || 'Unknown'}`}
      </div>
      {game?.status !== 'Active' && game?.status && (
        <div className="game-status">
          {formatGameStatus(game.status)}
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
