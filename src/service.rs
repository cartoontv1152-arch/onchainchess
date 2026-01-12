#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;
use self::state::ChessState;
use onchainchess::{ChessAbi, ChessOperation, GameState, ChessMove};
use async_graphql::{Object, Request, Response, Schema, SimpleObject};
use linera_sdk::{Service, ServiceRuntime};
use linera_sdk::abi::WithServiceAbi;
use linera_sdk::linera_base_types::AccountOwner;

use std::sync::Arc;
use tokio::sync::Mutex;

linera_sdk::service!(ChessService);
impl WithServiceAbi for ChessService {
    type Abi = ChessAbi;
}

pub struct ChessService {
    state: Arc<Mutex<ChessState>>,
    runtime: Arc<ServiceRuntime<Self>>,
}

impl Service for ChessService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let context = runtime.root_view_storage_context();
        let state = match ChessState::load(context.clone()).await {
            Ok(state) => state,
            Err(e) => {
                log::error!("Failed to load ChessState: {:?}", e);
                ChessState::create_empty(context)
            }
        };
        Self {
            state: Arc::new(Mutex::new(state)),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot {
                state: Arc::clone(&self.state),
                runtime: Arc::clone(&self.runtime),
            },
            MutationRoot {
                runtime: Arc::clone(&self.runtime),
                state: Arc::clone(&self.state),
            },
            async_graphql::EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

#[derive(SimpleObject)]
struct CreateGameResponse {
    success: bool,
    message: String,
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
    async fn get_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        game_id: u64,
    ) -> Result<Option<GameState>, async_graphql::Error> {
        let state = self.state.lock().await;
        Ok(state.get_game(game_id).await?)
    }

    async fn get_player_games(
        &self,
        _ctx: &async_graphql::Context<'_>,
        player: AccountOwner,
    ) -> Result<Vec<GameState>, async_graphql::Error> {
        let state = self.state.lock().await;
        Ok(state.get_player_games(&player).await?)
    }

    async fn get_available_games(
        &self,
        _ctx: &async_graphql::Context<'_>,
    ) -> Result<Vec<GameState>, async_graphql::Error> {
        let state = self.state.lock().await;
        Ok(state.get_available_games().await?)
    }
}

#[Object]
impl MutationRoot {
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

    async fn join_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        game_id: u64,
        player: AccountOwner,
    ) -> Result<JoinGameResponse, async_graphql::Error> {
        let operation = ChessOperation::JoinGame { game_id, player };
        self.runtime.schedule_operation(&operation);

        Ok(JoinGameResponse {
            success: true,
            message: "Join game scheduled".to_string(),
        })
    }

    async fn make_move(
        &self,
        _ctx: &async_graphql::Context<'_>,
        game_id: u64,
        player: AccountOwner,
        chess_move: ChessMove,
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

    async fn resign_game(
        &self,
        _ctx: &async_graphql::Context<'_>,
        game_id: u64,
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
