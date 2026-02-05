#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use self::state::ChessState;
use linera_sdk::{
    linera_base_types::{ChainId, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};
use onchainchess::{
    ChessAbi, CrossChainMessage, Game, InstantiationArgument, MatchStatus, Operation, PlayerInfo,
    ChessMove, Color, MoveRecord, ChessParameters, PieceType, Square,
};
use shakmaty::{Chess, Position, Square as ShakSquare, Role, Move, MoveKind, CastlingMode};

linera_sdk::contract!(ChessContract);

pub struct ChessContract {
    state: ChessState,
    runtime: ContractRuntime<Self>,
}

impl WithContractAbi for ChessContract {
    type Abi = ChessAbi;
}

impl ChessContract {
    fn is_host(&mut self, game: &Game) -> bool {
        game.host_chain_id == self.runtime.chain_id().to_string()
    }

    fn opponent_chain_id(&mut self, game: &Game) -> Option<ChainId> {
        let self_chain = self.runtime.chain_id().to_string();
        game.players
            .iter()
            .find(|p| p.chain_id != self_chain)
            .and_then(|p| p.chain_id.parse().ok())
    }

    fn reset_local_state(&mut self) {
        self.state.my_ready.set(false);
        self.state.opponent_ready.set(false);
    }

    fn can_play(&self, game: &Game) -> bool {
        game.status == MatchStatus::Active && game.players.len() == 2
    }

    // Convert our Square to shakmaty Square
    fn square_to_shakmaty(sq: &Square) -> Result<ShakSquare, String> {
        if sq.file > 7 || sq.rank > 7 {
            return Err("Invalid square coordinates".to_string());
        }
        // shakmaty uses File and Rank enums, convert from u8
        use shakmaty::{File, Rank};
        let file = File::from_index(sq.file as usize).map_err(|_| "Invalid file".to_string())?;
        let rank = Rank::from_index(sq.rank as usize).map_err(|_| "Invalid rank".to_string())?;
        Ok(ShakSquare::from_coords(file, rank))
    }

    // Convert our ChessMove to shakmaty Move
    fn chess_move_to_shakmaty(
        chess_move: &ChessMove,
        position: &Chess,
    ) -> Result<Move, String> {
        let from = Self::square_to_shakmaty(&chess_move.from)?;
        let to = Self::square_to_shakmaty(&chess_move.to)?;

        // Find the move in legal moves
        let legal_moves = position.legal_moves();
        for legal_move in legal_moves {
            if legal_move.from() == from && legal_move.to() == to {
                // Check promotion
                if let Some(promo) = chess_move.promotion {
                    if let MoveKind::Promotion { role } = legal_move.kind() {
                        let expected_role = match promo {
                            PieceType::Queen => Role::Queen,
                            PieceType::Rook => Role::Rook,
                            PieceType::Bishop => Role::Bishop,
                            PieceType::Knight => Role::Knight,
                            _ => return Err("Invalid promotion piece".to_string()),
                        };
                        if role == expected_role {
                            return Ok(legal_move);
                        }
                    }
                } else if !matches!(legal_move.kind(), MoveKind::Promotion { .. }) {
                    return Ok(legal_move);
                }
            }
        }
        Err("Move is not legal".to_string())
    }

    // Reconstruct position from move history
    fn reconstruct_position_from_moves(move_history: &[MoveRecord]) -> Result<Chess, String> {
        let mut position = Chess::default();
        
        for move_record in move_history {
            let from = Self::square_to_shakmaty(&move_record.chess_move.from)?;
            let to = Self::square_to_shakmaty(&move_record.chess_move.to)?;
            
            // Find matching legal move
            let legal_moves = position.legal_moves();
            let mut found_move = None;
            for legal_move in legal_moves {
                if legal_move.from() == from && legal_move.to() == to {
                    // Check promotion match
                    if let Some(promo) = move_record.chess_move.promotion {
                        if let MoveKind::Promotion { role } = legal_move.kind() {
                            let expected_role = match promo {
                                PieceType::Queen => Role::Queen,
                                PieceType::Rook => Role::Rook,
                                PieceType::Bishop => Role::Bishop,
                                PieceType::Knight => Role::Knight,
                                _ => continue,
                            };
                            if role == expected_role {
                                found_move = Some(legal_move);
                                break;
                            }
                        }
                    } else if !matches!(legal_move.kind(), MoveKind::Promotion { .. }) {
                        found_move = Some(legal_move);
                        break;
                    }
                }
            }
            
            let chess_move = found_move.ok_or_else(|| "Invalid move in history".to_string())?;
            position = position.play(&chess_move).map_err(|e| format!("Failed to apply move: {:?}", e))?;
        }
        
        Ok(position)
    }

    // Compute FEN from position
    fn compute_fen(position: &Chess) -> String {
        position.to_string()
    }

    // Detect game end conditions and determine winner
    // Returns (status, winner_chain_id) where winner_chain_id is None for draws
    fn detect_game_end(
        position: &Chess,
        player_color: Color,
        game: &Game,
        self_chain: &str,
    ) -> Option<(MatchStatus, Option<String>)> {
        if position.is_checkmate() {
            // If current player is in checkmate, opponent wins
            // Find opponent's chain ID
            let opponent_chain_id = game
                .players
                .iter()
                .find(|p| p.chain_id != self_chain)
                .map(|p| p.chain_id.clone());
            return Some((MatchStatus::Ended, opponent_chain_id));
        }
        if position.is_stalemate() {
            // Stalemate is a draw, no winner
            return Some((MatchStatus::Ended, None));
        }
        if position.is_insufficient_material() {
            // Insufficient material is a draw, no winner
            return Some((MatchStatus::Ended, None));
        }
        // Check for threefold repetition and 50-move rule would require move history
        None
    }
}

impl Contract for ChessContract {
    type Message = CrossChainMessage;
    type InstantiationArgument = InstantiationArgument;
    type Parameters = ChessParameters;
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = ChessState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        ChessContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: InstantiationArgument) {
        self.state.game.set(None);
        self.reset_local_state();
        self.state.last_notification.set(None);
    }

    async fn execute_operation(&mut self, operation: Operation) -> () {
        match operation {
            Operation::CreateMatch { host_name } => {
                let chain_id = self.runtime.chain_id().to_string();
                let match_id = self.runtime.system_time().micros().to_string();
                let initial_board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string();
                
                let game = Game {
                    match_id,
                    host_chain_id: chain_id.clone(),
                    status: MatchStatus::WaitingForPlayer,
                    players: vec![PlayerInfo {
                        chain_id,
                        name: host_name,
                    }],
                    current_turn: Color::White,
                    board: initial_board,
                    move_history: Vec::new(),
                    created_at: self.runtime.system_time().micros().to_string(),
                    last_move_at: None,
                    winner_chain_id: None,
                };
                self.state.game.set(Some(game));
                self.reset_local_state();
                self.state.last_notification.set(None);
            }

            Operation::JoinMatch {
                host_chain_id,
                player_name,
            } => {
                let target_chain: ChainId = host_chain_id.parse().expect("Invalid host chain ID");
                let player_chain_id = self.runtime.chain_id();
                self.runtime.send_message(
                    target_chain,
                    CrossChainMessage::JoinRequest {
                        player_chain_id,
                        player_name,
                    },
                );
            }

            Operation::MakeMove { chess_move } => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    panic!("Match not found");
                };

                if !self.can_play(game) {
                    panic!("Match not ready");
                }

                // Determine player color based on chain_id
                let self_chain = self.runtime.chain_id().to_string();
                let is_host = self.is_host(game);
                let player_color = if is_host {
                    Color::White
                } else {
                    Color::Black
                };

                // Validate it's the player's turn
                if game.current_turn != player_color {
                    panic!("Not your turn");
                }

                // Reconstruct position from move history using WASM validation
                let mut position = match Self::reconstruct_position_from_moves(&game.move_history) {
                    Ok(pos) => pos,
                    Err(e) => panic!("Failed to reconstruct position: {}", e),
                };

                // Validate move is legal using WASM
                let shakmaty_move = match Self::chess_move_to_shakmaty(&chess_move, &position) {
                    Ok(mv) => mv,
                    Err(e) => panic!("Invalid move: {}", e),
                };

                // Apply move
                position = match position.play(&shakmaty_move) {
                    Ok(new_pos) => new_pos,
                    Err(e) => panic!("Failed to apply move: {:?}", e),
                };

                // Compute FEN after move
                let fen_after = Self::compute_fen(&position);

                // Detect game end conditions and determine winner
                if let Some((end_status, winner)) = Self::detect_game_end(&position, player_color, game, &self_chain) {
                    game.status = end_status;
                    game.winner_chain_id = winner;
                }

                // Create move record with computed FEN
                let move_number = (game.move_history.len() + 1) as u32;
                let move_record = MoveRecord {
                    move_number,
                    chess_move: chess_move.clone(),
                    player_color,
                    timestamp: self.runtime.system_time().micros().to_string(),
                    fen_after: fen_after.clone(),
                };

                // Update game in-place through View system
                game.move_history.push(move_record);
                game.current_turn = if game.current_turn == Color::White {
                    Color::Black
                } else {
                    Color::White
                };
                game.last_move_at = Some(self.runtime.system_time().micros().to_string());
                game.board = fen_after; // Update board FEN

                // Send move to opponent via cross-chain message
                // Need to get opponent chain ID - use get() for read-only access
                if let Some(game_ref) = self.state.game.get() {
                    if let Some(opponent) = self.opponent_chain_id(game_ref) {
                        self.runtime.send_message(
                            opponent,
                            CrossChainMessage::MoveSync {
                                chess_move,
                                player_chain_id: self.runtime.chain_id(),
                            },
                        );
                    }
                }
            }

            Operation::ResignMatch => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    panic!("Match not found");
                };

                game.status = MatchStatus::Ended;
                
                // Determine winner based on who resigned
                let self_chain = self.runtime.chain_id().to_string();
                let is_host = self.is_host(game);
                if is_host {
                    // Host resigned, guest wins
                    if let Some(guest) = game.players.iter().find(|p| p.chain_id != self_chain) {
                        game.winner_chain_id = Some(guest.chain_id.clone());
                    }
                } else {
                    // Guest resigned, host wins
                    game.winner_chain_id = Some(game.host_chain_id.clone());
                }

                // Notify opponent - use get() for read-only access to get opponent chain ID
                if let Some(game_ref) = self.state.game.get() {
                    if let Some(opponent) = self.opponent_chain_id(game_ref) {
                        self.runtime.send_message(
                            opponent,
                            CrossChainMessage::ResignNotice {
                                player_chain_id: self.runtime.chain_id(),
                            },
                        );
                    }
                }
            }

            Operation::EndGame { status } => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    panic!("Match not found");
                };

                game.status = status;
                
                // Determine winner if game ended
                if status == MatchStatus::Ended {
                    let self_chain = self.runtime.chain_id().to_string();
                    // For now, set winner based on last move or other logic
                    // This can be enhanced with checkmate detection
                }

                // Notify opponent - use get() for read-only access to get opponent chain ID
                if let Some(game_ref) = self.state.game.get() {
                    if let Some(opponent) = self.opponent_chain_id(game_ref) {
                        self.runtime.send_message(
                            opponent,
                            CrossChainMessage::GameEndNotice {
                                player_chain_id: self.runtime.chain_id(),
                                status,
                            },
                        );
                    }
                }
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        match message {
            CrossChainMessage::JoinRequest {
                player_chain_id,
                player_name,
            } => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    panic!("Match not found");
                };

                if !self.is_host(game) {
                    panic!("Only host can accept joins");
                }
                if game.status != MatchStatus::WaitingForPlayer {
                    panic!("Match not joinable");
                }
                if game.players.len() >= 2 {
                    panic!("Match full");
                }

                game.players.push(PlayerInfo {
                    chain_id: player_chain_id.to_string(),
                    name: player_name,
                });
                game.status = MatchStatus::Active;
                self.reset_local_state();
                self.state.last_notification.set(Some("Player joined".to_string()));
                
                // Need to clone game for the message since we can't move it
                let game_for_message = game.clone();
                self.runtime.send_message(player_chain_id, CrossChainMessage::InitialStateSync { game: game_for_message });
            }

            CrossChainMessage::InitialStateSync { game } => {
                self.state.game.set(Some(game));
                self.reset_local_state();
                self.state.last_notification.set(Some("Match ready".to_string()));
            }

            CrossChainMessage::GameSync { game } => {
                self.state.game.set(Some(game));
                self.reset_local_state();
            }

            CrossChainMessage::MoveSync {
                chess_move,
                player_chain_id: _,
            } => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    return; // Match not found, skip
                };

                if !self.can_play(game) {
                    return;
                }

                // Determine opponent color
                let self_chain = self.runtime.chain_id().to_string();
                let is_host = self.is_host(game);
                let opponent_color = if is_host {
                    Color::Black
                } else {
                    Color::White
                };

                // Validate it's opponent's turn
                if game.current_turn != opponent_color {
                    return;
                }

                // Reconstruct position from move history
                let mut position = match Self::reconstruct_position_from_moves(&game.move_history) {
                    Ok(pos) => pos,
                    Err(_) => return, // Invalid position, skip move
                };

                // Validate and apply move using WASM
                let shakmaty_move = match Self::chess_move_to_shakmaty(&chess_move, &position) {
                    Ok(mv) => mv,
                    Err(_) => return, // Invalid move, skip
                };

                // Apply move
                position = match position.play(&shakmaty_move) {
                    Ok(new_pos) => new_pos,
                    Err(_) => return, // Failed to apply, skip
                };

                // Compute FEN after move
                let fen_after = Self::compute_fen(&position);

                // Detect game end conditions and determine winner
                if let Some((end_status, winner)) = Self::detect_game_end(&position, opponent_color, game, &self_chain) {
                    game.status = end_status;
                    game.winner_chain_id = winner;
                }

                // Create move record with computed FEN
                let move_number = (game.move_history.len() + 1) as u32;
                let move_record = MoveRecord {
                    move_number,
                    chess_move: chess_move.clone(),
                    player_color: opponent_color,
                    timestamp: self.runtime.system_time().micros().to_string(),
                    fen_after: fen_after.clone(),
                };

                // Update game in-place through View system
                game.move_history.push(move_record);
                game.current_turn = if game.current_turn == Color::White {
                    Color::Black
                } else {
                    Color::White
                };
                game.last_move_at = Some(self.runtime.system_time().micros().to_string());
                game.board = fen_after; // Update board FEN
            }

            CrossChainMessage::ResignNotice { player_chain_id: _ } => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    return; // Match not found, skip
                };

                game.status = MatchStatus::Ended;
                // Winner is the one who didn't resign
                let self_chain = self.runtime.chain_id().to_string();
                game.winner_chain_id = Some(self_chain);
                self.state.last_notification.set(Some("Opponent resigned".to_string()));
            }

            CrossChainMessage::GameEndNotice {
                player_chain_id: _,
                status,
            } => {
                // Use get_mut() to modify game state through View system
                let game = if let Some(game) = self.state.game.get_mut() {
                    game
                } else {
                    return; // Match not found, skip
                };

                game.status = status;
                self.state.last_notification.set(Some("Game ended".to_string()));
            }
        }
    }

    async fn process_streams(
        &mut self,
        _streams: Vec<linera_sdk::linera_base_types::StreamUpdate>,
    ) {
    }

    async fn store(mut self) {
        let _ = self.state.save().await;
    }
}
