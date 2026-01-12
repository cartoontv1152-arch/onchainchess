// Chess utilities for converting between formats

export const squareToAlgebraic = (square) => {
  if (!square) return '';
  const file = String.fromCharCode(97 + square.file); // a-h
  const rank = square.rank + 1; // 1-8
  return `${file}${rank}`;
};

export const algebraicToSquare = (alg) => {
  if (!alg || alg.length !== 2) return null;
  const file = alg.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(alg.charAt(1)) - 1; // 1=0, 8=7
  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
  return { file, rank };
};

export const squareToIndex = (square) => {
  if (!square) return -1;
  return square.rank * 8 + square.file;
};

export const indexToSquare = (index) => {
  if (index < 0 || index > 63) return null;
  return {
    file: index % 8,
    rank: Math.floor(index / 8),
  };
};

export const uciToChessMove = (uci) => {
  if (!uci || uci.length < 4) return null;
  const from = algebraicToSquare(uci.substring(0, 2));
  const to = algebraicToSquare(uci.substring(2, 4));
  if (!from || !to) return null;
  
  let promotion = null;
  if (uci.length > 4) {
    const promoChar = uci.charAt(4).toLowerCase();
    const promotions = {
      'q': 'Queen',
      'r': 'Rook',
      'b': 'Bishop',
      'n': 'Knight',
    };
    promotion = promotions[promoChar] || null;
  }

  return {
    from,
    to,
    promotion,
  };
};

export const chessMoveToUci = (move) => {
  if (!move || !move.from || !move.to) return '';
  const from = squareToAlgebraic(move.from);
  const to = squareToAlgebraic(move.to);
  let uci = `${from}${to}`;
  
  if (move.promotion) {
    const promoChar = move.promotion.charAt(0).toLowerCase();
    uci += promoChar;
  }
  
  return uci;
};

export const formatGameStatus = (status) => {
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

export const formatColor = (color) => {
  return color === 'White' ? 'White' : 'Black';
};

export const formatAddress = (address) => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default {
  squareToAlgebraic,
  algebraicToSquare,
  squareToIndex,
  indexToSquare,
  uciToChessMove,
  chessMoveToUci,
  formatGameStatus,
  formatColor,
  formatAddress,
};
