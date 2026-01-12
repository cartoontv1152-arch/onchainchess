import React from 'react';
import { squareToAlgebraic } from '../utils/chessUtils';

const MoveHistory = ({ moveHistory }) => {
  if (!moveHistory || moveHistory.length === 0) {
    return (
      <div className="move-history-empty">
        <p>No moves yet. Make the first move!</p>
      </div>
    );
  }

  const formatMove = (move, index) => {
    if (!move || !move.from || !move.to) return '';
    const from = squareToAlgebraic(move.from);
    const to = squareToAlgebraic(move.to);
    const promotion = move.promotion ? `=${move.promotion.charAt(0)}` : '';
    return `${from}${to}${promotion}`;
  };

  return (
    <div className="move-history-container">
      <h3 className="move-history-title">Move History</h3>
      <div className="move-history-list">
        {moveHistory.map((move, index) => {
          const moveNumber = Math.floor(index / 2) + 1;
          const isWhiteMove = index % 2 === 0;
          
          return (
            <div
              key={index}
              className={`move-history-item ${isWhiteMove ? 'white-move' : 'black-move'}`}
            >
              {isWhiteMove && (
                <span className="move-number">{moveNumber}.</span>
              )}
              <span className="move-notation">{formatMove(move, index)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoveHistory;
