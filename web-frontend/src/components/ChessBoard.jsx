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
    if (!game) return false;
    if (game.status !== 'Active') return false;
    if (!isPlayerTurn) return false;
    return true;
  };

  const onSquareClick = (square) => {
    if (!canMakeMove()) return;

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

    // Format move and send to chain - WASM validates on-chain
    // No validation here - just format and send
    const chessMove = {
      from: algebraicToSquare(moveFrom),
      to: algebraicToSquare(square),
      promotion: null, // Will be determined by WASM if needed
    };

    // Send to chain - contract validates on-chain
    if (onMove) {
      onMove(chessMove);
    }

    // Reset selection
    setMoveFrom(null);
    setPossibleMoves([]);
  };

  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (!canMakeMove()) return false;

    // Format move and send to chain - WASM validates on-chain
    // No validation here - just format and send
    const chessMove = {
      from: algebraicToSquare(sourceSquare),
      to: algebraicToSquare(targetSquare),
      promotion: null, // Will be determined by WASM if needed
    };

    // Send to chain - contract validates on-chain
    if (onMove) {
      onMove(chessMove);
    }

    setMoveFrom(null);
    setPossibleMoves([]);
    return true; // Always return true to allow drop - validation happens on-chain
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
    <div className="chess-board-container">
      <div className="chess-board-wrapper">
        <Chessboard
          position={gameState.fen()}
          onSquareClick={onSquareClick}
          onPieceDrop={onPieceDrop}
          customSquareStyles={getCustomSquareStyles()}
          boardOrientation={getBoardOrientation()}
          arePiecesDraggable={canMakeMove()}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        />
      </div>
      {!canMakeMove() && game?.status === 'Active' && (
        <div className="turn-indicator">
          {isPlayerTurn ? 'Your turn' : 'Waiting for opponent...'}
        </div>
      )}
      {game?.status !== 'Active' && game?.status && (
        <div className="game-status">
          {formatGameStatus(game.status)}
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
