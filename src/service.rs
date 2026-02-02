#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;
use self::state::ChessState;
use onchainchess::{ChessAbi, ChessOperation, GameState, ChessMove};
use async_graphql::{Object, Request, Response, Schema, SimpleObject};
use linera_sdk::{Service, ServiceRuntime};
use linera_sdk::abi::WithServiceAbi;
use linera_sdk::linera_base_types::AccountOwner;
use linera_sdk::views::View;

use std::sync::Arc;
use tokio::sync::Mutex;

linera_sdk::service!(ChessService);
impl WithServiceAbi for ChessService {
    type Abi = ChessAbi;
}

pub struct ChessService {
    runtime: Arc<ServiceRuntime<Self>>,
}

impl Service for ChessService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        Self {
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        // Log the incoming query to see what's being requested
        let operation_name = request.operation_name.as_deref().unwrap_or("<unnamed>");
        log::info!("Service: Received GraphQL operation: {}", operation_name);
        
        // Log query string for debugging
        let query_string = &request.query;
        let query_preview = if query_string.len() > 200 {
            &query_string[..200]
        } else {
            query_string.as_str()
        };
        log::info!("Service: Query string preview: {}", query_preview);
        
        // Check for specific queries
        if query_string.contains("getGame") || query_string.contains("get_game") {
            log::info!("Service: ✅ Detected getGame/get_game query in request");
        }
        if query_string.contains("getAvailableGames") || query_string.contains("get_available_games") {
            log::info!("Service: ✅ Detected getAvailableGames query in request");
        }
        if query_string.contains("getPlayerGames") || query_string.contains("get_player_games") {
            log::info!("Service: ✅ Detected getPlayerGames query in request");
        }
        
        // Log variables if present
        if !request.variables.is_empty() {
            log::info!("Service: Query variables: {:?}", request.variables);
        }
        
        // Reload state from storage on each query to get latest updates from contract
        // This ensures we always have fresh data from the blockchain
        let context = self.runtime.root_view_storage_context();
        let chain_id = self.runtime.chain_id();
        log::info!("Service: Loading state from storage context (chain: {:?})", chain_id);
        
        let state = match ChessState::load(context.clone()).await {
            Ok(state) => {
                // Access game_counter to trigger loading from storage
                let counter = *state.game_counter.get();
                log::info!("Service: Loaded state, game_counter = {} (chain: {:?})", counter, chain_id);
                state
            },
            Err(e) => {
                log::error!("Failed to reload ChessState: {:?} (chain: {:?})", e, chain_id);
                ChessState::create_empty(context)
            }
        };
        
        // Create a fresh Arc with the reloaded state for this query
        let state_arc = Arc::new(Mutex::new(state));
        
        let schema = Schema::build(
            QueryRoot {
                state: Arc::clone(&state_arc),
                runtime: Arc::clone(&self.runtime),
            },
            MutationRoot {
                runtime: Arc::clone(&self.runtime),
                state: Arc::clone(&state_arc),
            },
            async_graphql::EmptySubscription,
        )
        .finish();
        
        let response = schema.execute(request).await;
        
        // Log any errors in the response
        if !response.errors.is_empty() {
            log::error!("Service: GraphQL errors: {:?}", response.errors);
        }
        
        response
    }
}

#[derive(SimpleObject)]
struct CreateGameResponse {
    success: bool,
    message: String,
    #[graphql(name = "gameId")]
    game_id: Option<u64>,
}

#[derive(SimpleObject)]
struct JoinGameResponse {
    success: bool,
    message: String,
}

#[derive(SimpleObject)]
struct MakeMoveResponse {
    success: bool,
    message: String,
}

#[derive(SimpleObject)]
struct ResignGameResponse {
    success: bool,
    message: String,
}

struct QueryRoot {
    state: Arc<Mutex<ChessState>>,
    runtime: Arc<ServiceRuntime<ChessService>>,
}

struct MutationRoot {
    runtime: Arc<ServiceRuntime<ChessService>>,
    state: Arc<Mutex<ChessState>>,
}


#[Object]
impl QueryRoot {
    #[graphql(name = "getGame")]
    async fn get_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        #[graphql(name = "gameId")] game_id: u64,
    ) -> Result<Option<GameState>, async_graphql::Error> {
        let state = self.state.lock().await;
        let counter = *state.game_counter.get();
        log::info!("Query get_game({}): game_counter = {}", game_id, counter);
        
        let result = state.get_game(game_id).await?;
        if result.is_none() {
            log::warn!("Query get_game({}): Game not found (counter: {})", game_id, counter);
            // Log all available game IDs for debugging
            if counter > 0 {
                let mut available_ids = Vec::new();
                for id in 1..=counter {
                    if let Ok(Some(_)) = state.get_game(id).await {
                        available_ids.push(id);
                    }
                }
                log::info!("Available game IDs: {:?}", available_ids);
            }
        } else {
            log::info!("Query get_game({}): Found game with id {}", game_id, result.as_ref().map(|g| g.game_id).unwrap_or(0));
        }
        Ok(result)
    }

    #[graphql(name = "getPlayerGames")]
    async fn get_player_games(
        &self,
        _ctx: &async_graphql::Context<'_>,
        player: AccountOwner,
    ) -> Result<Vec<GameState>, async_graphql::Error> {
        let state = self.state.lock().await;
        let result = state.get_player_games(&player).await?;
        log::info!("Query get_player_games({}): found {} games", player, result.len());
        if result.is_empty() {
            log::debug!("No games found for player {}", player);
        }
        Ok(result)
    }

    #[graphql(name = "getAvailableGames")]
    async fn get_available_games(
        &self,
        _ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<GameState>, async_graphql::Error> {
        let state = self.state.lock().await;
        let result = state.get_available_games().await?;
        log::info!("Query get_available_games(): found {} games", result.len());
        if result.is_empty() {
            log::debug!("No available games found");
        }
        Ok(result)
    }
}

#[Object]
impl MutationRoot {
    #[graphql(name = "createGame")]
    async fn create_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        creator: AccountOwner,
    ) -> Result<CreateGameResponse, async_graphql::Error> {
        let operation = ChessOperation::CreateGame { creator };
        self.runtime.schedule_operation(&operation);

        Ok(CreateGameResponse {
            success: true,
            message: "Game creation scheduled".to_string(),
            game_id: None,
        })
    }

    #[graphql(name = "joinGame")]
    async fn join_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        #[graphql(name = "gameId")] game_id: u64,
        player: AccountOwner,
    ) -> Result<JoinGameResponse, async_graphql::Error> {
        // First check if game exists
        let state = self.state.lock().await;
        let game_exists = state.get_game(game_id).await?;
        drop(state);
        
        if game_exists.is_none() {
            log::warn!("Join game failed: Game {} not found", game_id);
            return Ok(JoinGameResponse {
                success: false,
                message: format!("Game {} not found", game_id),
            });
        }
        
        let operation = ChessOperation::JoinGame { game_id, player };
        self.runtime.schedule_operation(&operation);
        log::info!("Join game operation scheduled for game {} by player {}", game_id, player);

        Ok(JoinGameResponse {
            success: true,
            message: "Join game scheduled".to_string(),
        })
    }

    #[graphql(name = "makeMove")]
    async fn make_move(
        &self,
        _ctx: &async_graphql::Context<'_>,
        #[graphql(name = "gameId")] game_id: u64,
        player: AccountOwner,
        #[graphql(name = "chessMove")] chess_move: ChessMove,
    ) -> Result<MakeMoveResponse, async_graphql::Error> {
        let operation = ChessOperation::MakeMove {
            game_id,
            player,
            chess_move,
        };
        self.runtime.schedule_operation(&operation);

        Ok(MakeMoveResponse {
            success: true,
            message: "Move scheduled".to_string(),
        })
    }

    #[graphql(name = "resignGame")]
    async fn resign_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        #[graphql(name = "gameId")] game_id: u64,
        player: AccountOwner,
    ) -> Result<ResignGameResponse, async_graphql::Error> {
        let operation = ChessOperation::ResignGame { game_id, player };
        self.runtime.schedule_operation(&operation);

        Ok(ResignGameResponse {
            success: true,
            message: "Resignation scheduled".to_string(),
        })
    }
}
