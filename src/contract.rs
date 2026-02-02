#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;
use crate::state::ChessState;
use linera_sdk::{Contract, ContractRuntime};
use linera_sdk::abi::WithContractAbi;
use linera_sdk::linera_base_types::{AccountOwner, StreamName};
use linera_sdk::views::{RootView, View};
use onchainchess::{ChessAbi, ChessMessage, ChessOperation, GameStatus, Color};

linera_sdk::contract!(ChessContract);

pub struct ChessContract {
    state: ChessState,
    runtime: ContractRuntime<Self>,
}

impl Contract for ChessContract {
    type Message = ChessMessage;
    type Parameters = ();
    type InstantiationArgument = serde_json::Value;
    type EventValue = ChessMessage;

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let context = runtime.root_view_storage_context();
        let state = ChessState::load(context)
            .await
            .expect("Failed to load state");
        Self {
            state,
            runtime,
        }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        log::info!("Chess contract instantiate called");
        
        if self.state.owner.get().is_some() {
            log::info!("Contract already has an owner, skipping initialization");
            return;
        }

        let contract_address: AccountOwner = self.runtime.application_id().into();
        let _ = self.state.set_owner(contract_address).await;
        log::info!("Chess contract owner set to: {}", contract_address);
    }

    async fn execute_operation(&mut self, operation: ChessOperation) {
        let timestamp = self.runtime.system_time().micros();
        
        match operation {
            ChessOperation::CreateGame { creator } => {
                match self.state.create_game(creator, timestamp).await {
                    Ok(game_id) => {
                        log::info!("Game {} created by {} (timestamp: {})", game_id, creator, timestamp);
                        
                        self.runtime.emit(
                            StreamName::from("chess_events"),
                            &ChessMessage::GameCreated {
                                game_id,
                                creator,
                            },
                        );
                    }
                    Err(e) => {
                        log::error!("Failed to create game: {:?}", e);
                    }
                }
            }
            ChessOperation::JoinGame { game_id, player } => {
                match self.state.join_game(game_id, player).await {
                    Ok(_) => {
                        log::info!("Player {} joined game {}", player, game_id);
                        
                        self.runtime.emit(
                            StreamName::from("chess_events"),
                            &ChessMessage::GameJoined {
                                game_id,
                                player,
                            },
                        );
                    }
                    Err(e) => {
                        log::error!("Failed to join game {}: {:?}", game_id, e);
                    }
                }
            }
            ChessOperation::MakeMove { game_id, player, chess_move } => {
                match self.state.get_game(game_id).await {
                    Ok(Some(mut game)) => {
                        // Validate it's the player's turn
                        let is_white = game.white_player == player;
                        let is_black = game.black_player == Some(player);
                        
                        if !is_white && !is_black {
                            log::error!("Player {} is not part of game {}", player, game_id);
                            return;
                        }
                        
                        if game.status != GameStatus::InProgress {
                            log::error!("Game {} is not in progress", game_id);
                            return;
                        }
                        
                        let is_white_turn = game.current_turn == Color::White;
                        if (is_white && !is_white_turn) || (is_black && is_white_turn) {
                            log::error!("Not player {} turn in game {}", player, game_id);
                            return;
                        }
                        
                        // Apply move (simplified - frontend validates)
                        // In production, you'd validate the move here
                        game.move_history.push(chess_move.clone());
                        game.current_turn = if game.current_turn == Color::White {
                            Color::Black
                        } else {
                            Color::White
                        };
                        game.last_move_at = timestamp;
                        
                        // Update game status (simplified - check for checkmate/stalemate)
                        // In production, implement full chess logic
                        
                        match self.state.update_game(game_id, game.clone()).await {
                            Ok(_) => {
                                log::info!("Move applied to game {} by {}", game_id, player);
                                
                                self.runtime.emit(
                                    StreamName::from("chess_events"),
                                    &ChessMessage::MoveMade {
                                        game_id,
                                        player,
                                        chess_move,
                                    },
                                );
                            }
                            Err(e) => {
                                log::error!("Failed to save move: {:?}", e);
                            }
                        }
                    }
                    Ok(None) => {
                        log::error!("Game {} not found", game_id);
                    }
                    Err(e) => {
                        log::error!("Failed to get game {}: {:?}", game_id, e);
                    }
                }
            }
            ChessOperation::ResignGame { game_id, player } => {
                match self.state.get_game(game_id).await {
                    Ok(Some(mut game)) => {
                        let is_white = game.white_player == player;
                        let is_black = game.black_player == Some(player);
                        
                        if !is_white && !is_black {
                            log::error!("Player {} is not part of game {}", player, game_id);
                            return;
                        }
                        
                        game.status = if is_white {
                            GameStatus::BlackWon
                        } else {
                            GameStatus::WhiteWon
                        };
                        
                        match self.state.update_game(game_id, game.clone()).await {
                            Ok(_) => {
                                log::info!("Player {} resigned game {}", player, game_id);
                                
                                self.runtime.emit(
                                    StreamName::from("chess_events"),
                                    &ChessMessage::GameEnded {
                                        game_id,
                                        status: game.status,
                                    },
                                );
                            }
                            Err(e) => {
                                log::error!("Failed to save resignation: {:?}", e);
                            }
                        }
                    }
                    Ok(None) => {
                        log::error!("Game {} not found", game_id);
                    }
                    Err(e) => {
                        log::error!("Failed to get game {}: {:?}", game_id, e);
                    }
                }
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        // Handle cross-chain messages if needed
        match message {
            ChessMessage::GameCreated { .. } => {}
            ChessMessage::GameJoined { .. } => {}
            ChessMessage::MoveMade { .. } => {}
            ChessMessage::GameEnded { .. } => {}
        }
    }

    async fn store(mut self) {
        let _ = self.state.save().await;
    }
}

impl WithContractAbi for ChessContract {
    type Abi = ChessAbi;
}
