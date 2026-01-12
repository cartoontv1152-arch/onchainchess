import React, { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { squareToAlgebraic, algebraicToSquare, chessMoveToUci } from '../utils/chessUtils';

const ChessBoard = ({ game, player, onMove, isLoading }) => {
  const [gameState, setGameState] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  // Update game state when game prop changes
  useEffect(() => {
    if (game && game.board) {
      try {
        const chess = new Chess(game.board);
        setGameState(chess);
      } catch (error) {
        console.error('Error loading game state:', error);
        // Fallback to starting position
        setGameState(new Chess());
      }
    }
  }, [game]);

  // Apply moves from game history
  useEffect(() => {
    if (game && game.moveHistory && game.moveHistory.length > 0) {
      const chess = new Chess();
      
      // Try to apply moves from history
      try {
        game.moveHistory.forEach((move) => {
          const uci = chessMoveToUci(move);
          if (uci && chess.move(uci)) {
            // Move applied successfully
          }
        });
        setGameState(chess);
      } catch (error) {
        console.error('Error applying move history:', error);
        // Try to load from FEN if available
        if (game.board) {
          try {
            const chessFromFen = new Chess(game.board);
            setGameState(chessFromFen);
          } catch (fenError) {
            console.error('Error loading from FEN:', fenError);
          }
        }
      }
    }
  }, [game?.moveHistory, game?.board]);

  const isPlayerTurn = () => {
    if (!game || !player) return false;
    const isWhite = game.whitePlayer === player;
    const isBlack = game.blackPlayer === player;
    const isWhiteTurn = game.currentTurn === 'White';
    return (isWhite && isWhiteTurn) || (isBlack && !isWhiteTurn);
  };

  const canMakeMove = () => {
    if (!game || !player) return false;
    if (game.status !== 'InProgress') return false;
    if (isLoading) return false;
    return isPlayerTurn();
  };

  const onSquareClick = (square) => {
    if (!canMakeMove()) return;

    // If no square is selected, select this square
    if (!moveFrom) {
      const piece = gameState.get(square);
      // Check if piece belongs to player
      const isWhite = game.whitePlayer === player;
      const pieceColor = piece?.color === 'w' ? 'White' : 'Black';
      if (piece && pieceColor === (isWhite ? 'White' : 'Black')) {
        setMoveFrom(square);
        // Get possible moves
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

    // Try to make move
    try {
      const move = gameState.move({
        from: moveFrom,
        to: square,
        promotion: 'q', // Auto-promote to queen
      });

      if (move) {
        // Convert to our format
        const chessMove = {
          from: algebraicToSquare(moveFrom),
          to: algebraicToSquare(square),
          promotion: move.promotion ? move.promotion.toUpperCase() : null,
        };

        // Call onMove callback
        if (onMove) {
          onMove(chessMove);
        }

        // Reset selection
        setMoveFrom(null);
        setPossibleMoves([]);
      } else {
        // Invalid move, deselect
        setMoveFrom(null);
        setPossibleMoves([]);
      }
    } catch (error) {
      console.error('Error making move:', error);
      setMoveFrom(null);
      setPossibleMoves([]);
    }
  };

  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (!canMakeMove()) return false;

    try {
      const move = gameState.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        const chessMove = {
          from: algebraicToSquare(sourceSquare),
          to: algebraicToSquare(targetSquare),
          promotion: move.promotion ? move.promotion.toUpperCase() : null,
        };

        if (onMove) {
          onMove(chessMove);
        }

        setMoveFrom(null);
        setPossibleMoves([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error dropping piece:', error);
      return false;
    }
  };

  const getCustomSquareStyles = () => {
    const styles = {};
    
    // Highlight selected square
    if (moveFrom) {
      styles[moveFrom] = {
        background: 'rgba(255, 255, 0, 0.4)',
      };
    }

    // Highlight possible move squares
    possibleMoves.forEach((square) => {
      styles[square] = {
        background: 'rgba(0, 255, 0, 0.4)',
      };
    });

    return styles;
  };

  // Helper functions
  const chessMoveToUci = (move) => {
    if (!move || !move.from || !move.to) return null;
    const fromFile = String.fromCharCode(97 + move.from.file);
    const fromRank = move.from.rank + 1;
    const toFile = String.fromCharCode(97 + move.to.file);
    const toRank = move.to.rank + 1;
    return `${fromFile}${fromRank}${toFile}${toRank}`;
  };

  const algebraicToSquare = (alg) => {
    if (!alg || alg.length !== 2) return null;
    const file = alg.charCodeAt(0) - 97;
    const rank = parseInt(alg.charAt(1)) - 1;
    return { file, rank };
  };

  const getBoardOrientation = () => {
    if (!game || !player) return 'white';
    const isWhite = game.whitePlayer === player;
    return isWhite ? 'white' : 'black';
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
      {!canMakeMove() && game?.status === 'InProgress' && (
        <div className="turn-indicator">
          {isPlayerTurn() ? 'Your turn' : 'Waiting for opponent...'}
        </div>
      )}
      {game?.status !== 'InProgress' && (
        <div className="game-status">
          {formatGameStatus(game.status)}
        </div>
      )}
    </div>
  );
};

const formatGameStatus = (status) => {
  const statusMap = {
    WaitingForPlayer: 'Waiting for player',
    InProgress: 'In progress',
    WhiteWon: 'White won',
    BlackWon: 'Black won',
    Draw: 'Draw',
    Stalemate: 'Stalemate',
    Checkmate: 'Checkmate',
  };
  return statusMap[status] || status;
};

export default ChessBoard;
