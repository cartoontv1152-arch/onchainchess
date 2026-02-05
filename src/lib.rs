#![cfg_attr(target_arch = "wasm32", no_main)]

use serde::{Deserialize, Serialize};
use linera_sdk::linera_base_types::ChainId;
use linera_sdk::abi::{ContractAbi as LineraContractAbi, ServiceAbi as LineraServiceAbi};
use async_graphql::{Enum, InputObject, SimpleObject, Request, Response};

// ABI
pub struct ChessAbi;

impl LineraContractAbi for ChessAbi {
    type Operation = Operation;
    type Response = ();
}

impl LineraServiceAbi for ChessAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
pub struct ChessParameters;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct InstantiationArgument;

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

// Game status (MatchStatus equivalent)
#[derive(Clone, Copy, Serialize, Deserialize, Debug, PartialEq, Eq, Enum)]
pub enum MatchStatus {
    WaitingForPlayer,
    Active,
    Ended,
}

// Player info
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[graphql(rename_fields = "camelCase")]
pub struct PlayerInfo {
    pub chain_id: String,
    pub name: String,
}

// Move record (similar to RoundRecord in SPS)
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[graphql(rename_fields = "camelCase")]
pub struct MoveRecord {
    pub move_number: u32,
    pub chess_move: ChessMove,
    pub player_color: Color,
    pub timestamp: String,
    pub fen_after: String,
}

// Game structure (single game per chain, like SPS)
#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
#[graphql(rename_fields = "camelCase")]
pub struct Game {
    pub match_id: String,
    pub host_chain_id: String,
    pub status: MatchStatus,
    pub players: Vec<PlayerInfo>,
    pub current_turn: Color,
    pub board: String, // FEN notation
    pub move_history: Vec<MoveRecord>,
    pub created_at: String,
    pub last_move_at: Option<String>,
    pub winner_chain_id: Option<String>,
}

// Operation types
#[derive(Debug, Serialize, Deserialize)]
pub enum Operation {
    CreateMatch { host_name: String },
    JoinMatch { host_chain_id: String, player_name: String },
    MakeMove { chess_move: ChessMove },
    ResignMatch,
    EndGame { status: MatchStatus },
}

// Cross-chain message types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CrossChainMessage {
    JoinRequest { player_chain_id: ChainId, player_name: String },
    InitialStateSync { game: Game },
    GameSync { game: Game },
    MoveSync { chess_move: ChessMove, player_chain_id: ChainId },
    ResignNotice { player_chain_id: ChainId },
    GameEndNotice { player_chain_id: ChainId, status: MatchStatus },
}
