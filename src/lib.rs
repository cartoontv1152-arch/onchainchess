#![cfg_attr(target_arch = "wasm32", no_main)]

use serde::{Deserialize, Serialize};
use linera_sdk::linera_base_types::AccountOwner;
use linera_sdk::abi::{ContractAbi, ServiceAbi};
use async_graphql::{Enum, InputObject, SimpleObject};

// Chess piece types
#[derive(Clone, Copy, Serialize, Deserialize, Debug, PartialEq, Eq, Enum)]
pub enum PieceType {
    Pawn,
    Rook,
    Knight,
    Bishop,
    Queen,
    King,
}

// Chess colors
#[derive(Clone, Copy, Serialize, Deserialize, Debug, PartialEq, Eq, Enum)]
pub enum Color {
    White,
    Black,
}

// Square position (0-63, or algebraic notation like "e4")
#[derive(Clone, Copy, Serialize, Deserialize, Debug, PartialEq, Eq, SimpleObject, InputObject)]
#[graphql(input_name = "SquareInput")]
pub struct Square {
    pub file: u8, // 0-7 (a-h)
    pub rank: u8, // 0-7 (1-8)
}

impl Square {
    pub fn new(file: u8, rank: u8) -> Self {
        Self { file, rank }
    }

    pub fn from_algebraic(alg: &str) -> Option<Self> {
        if alg.len() != 2 {
            return None;
        }
        let file = alg.chars().nth(0)? as u8 - b'a';
        let rank = alg.chars().nth(1)? as u8 - b'1';
        if file < 8 && rank < 8 {
            Some(Self { file, rank })
        } else {
            None
        }
    }

    pub fn to_algebraic(&self) -> String {
        format!("{}{}", (self.file + b'a') as char, self.rank + 1)
    }

    pub fn to_index(&self) -> u8 {
        self.rank * 8 + self.file
    }

    pub fn from_index(index: u8) -> Self {
        Self {
            file: index % 8,
            rank: index / 8,
        }
    }
}

// Chess move
#[derive(Clone, Serialize, Deserialize, Debug, SimpleObject, InputObject)]
#[graphql(input_name = "ChessMoveInput")]
pub struct ChessMove {
    pub from: Square,
    pub to: Square,
    pub promotion: Option<PieceType>, // For pawn promotion
}

impl ChessMove {
    pub fn from_uci(uci: &str) -> Option<Self> {
        if uci.len() < 4 {
            return None;
        }
        let from = Square::from_algebraic(&uci[0..2])?;
        let to = Square::from_algebraic(&uci[2..4])?;
        let promotion = if uci.len() > 4 {
            match uci.chars().nth(4)? {
                'q' => Some(PieceType::Queen),
                'r' => Some(PieceType::Rook),
                'b' => Some(PieceType::Bishop),
                'n' => Some(PieceType::Knight),
                _ => None,
            }
        } else {
            None
        };
        Some(Self { from, to, promotion })
    }

    pub fn to_uci(&self) -> String {
        let mut uci = format!("{}{}", self.from.to_algebraic(), self.to.to_algebraic());
        if let Some(promo) = self.promotion {
            uci.push(match promo {
                PieceType::Queen => 'q',
                PieceType::Rook => 'r',
                PieceType::Bishop => 'b',
                PieceType::Knight => 'n',
                _ => 'q',
            });
        }
        uci
    }
}

// Game status
#[derive(Clone, Copy, Serialize, Deserialize, Debug, PartialEq, Eq, Enum)]
pub enum GameStatus {
    WaitingForPlayer,
    InProgress,
    WhiteWon,
    BlackWon,
    Draw,
    Stalemate,
    Checkmate,
}

// Game state structure
#[derive(Clone, Serialize, Deserialize, Debug, SimpleObject)]
pub struct GameState {
    #[graphql(name = "gameId")]
    pub game_id: u64,
    #[graphql(name = "whitePlayer")]
    pub white_player: AccountOwner,
    #[graphql(name = "blackPlayer")]
    pub black_player: Option<AccountOwner>,
    #[graphql(name = "currentTurn")]
    pub current_turn: Color,
    pub status: GameStatus,
    pub board: String, // FEN notation
    #[graphql(name = "moveHistory")]
    pub move_history: Vec<ChessMove>,
    #[graphql(name = "createdAt")]
    pub created_at: u64,
    #[graphql(name = "lastMoveAt")]
    pub last_move_at: u64,
}

// Operation types
#[derive(Clone, Serialize, Deserialize, Debug)]
pub enum ChessOperation {
    CreateGame {
        creator: AccountOwner,
    },
    JoinGame {
        game_id: u64,
        player: AccountOwner,
    },
    MakeMove {
        game_id: u64,
        player: AccountOwner,
        chess_move: ChessMove,
    },
    ResignGame {
        game_id: u64,
        player: AccountOwner,
    },
}

// Message types (for cross-chain)
#[derive(Clone, Serialize, Deserialize, Debug)]
pub enum ChessMessage {
    GameCreated {
        game_id: u64,
        creator: AccountOwner,
    },
    GameJoined {
        game_id: u64,
        player: AccountOwner,
    },
    MoveMade {
        game_id: u64,
        player: AccountOwner,
        chess_move: ChessMove,
    },
    GameEnded {
        game_id: u64,
        status: GameStatus,
    },
}

// ABI
pub struct ChessAbi;

impl ContractAbi for ChessAbi {
    type Operation = ChessOperation;
    type Response = ();
}

impl ServiceAbi for ChessAbi {
    type Query = async_graphql::Request;
    type QueryResponse = async_graphql::Response;
}
