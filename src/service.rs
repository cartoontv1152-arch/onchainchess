#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use linera_sdk::{linera_base_types::WithServiceAbi, views::View, Service, ServiceRuntime};
use onchainchess::{
    ChessAbi, ChessMove, Game, MatchStatus, Operation, ChessParameters, Color,
};

use self::state::ChessState;

linera_sdk::service!(ChessService);

pub struct ChessService {
    state: ChessState,
    runtime: Arc<ServiceRuntime<Self>>,
}

impl WithServiceAbi for ChessService {
    type Abi = ChessAbi;
}

impl Service for ChessService {
    type Parameters = ChessParameters;

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = ChessState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        ChessService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let game = self.state.game.get().clone();
        let my_ready = self.state.my_ready.get().clone();
        let opponent_ready = self.state.opponent_ready.get().clone();
        let last_notification = self.state.last_notification.get().clone();
        let schema = Schema::build(
            QueryRoot {
                game,
                chain_id: self.runtime.chain_id().to_string(),
                my_ready,
                opponent_ready,
                last_notification,
            },
            MutationRoot {
                runtime: self.runtime.clone(),
            },
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

struct QueryRoot {
    game: Option<Game>,
    chain_id: String,
    my_ready: bool,
    opponent_ready: bool,
    last_notification: Option<String>,
}

#[Object]
impl QueryRoot {
    async fn game(&self) -> Option<&Game> {
        self.game.as_ref()
    }

    async fn match_status(&self) -> Option<MatchStatus> {
        self.game.as_ref().map(|g| g.status)
    }

    async fn is_host(&self) -> bool {
        self.game
            .as_ref()
            .map(|g| g.host_chain_id == self.chain_id)
            .unwrap_or(false)
    }

    async fn opponent_chain_id(&self) -> Option<String> {
        let game = self.game.as_ref()?;
        game.players
            .iter()
            .find(|p| p.chain_id != self.chain_id)
            .map(|p| p.chain_id.clone())
    }

    async fn current_turn(&self) -> Option<Color> {
        self.game.as_ref().map(|g| g.current_turn)
    }

    async fn my_ready(&self) -> bool {
        self.my_ready
    }

    async fn opponent_ready(&self) -> bool {
        self.opponent_ready
    }

    async fn last_notification(&self) -> Option<String> {
        self.last_notification.clone()
    }

    async fn move_history(&self) -> Vec<onchainchess::MoveRecord> {
        self.game
            .as_ref()
            .map(|g| g.move_history.clone())
            .unwrap_or_default()
    }
}

struct MutationRoot {
    runtime: Arc<ServiceRuntime<ChessService>>,
}

#[Object]
impl MutationRoot {
    async fn create_match(&self, host_name: String) -> String {
        self.runtime
            .schedule_operation(&Operation::CreateMatch { host_name: host_name.clone() });
        format!("Match created by '{}'", host_name)
    }

    async fn join_match(&self, host_chain_id: String, player_name: String) -> String {
        self.runtime.schedule_operation(&Operation::JoinMatch {
            host_chain_id: host_chain_id.clone(),
            player_name: player_name.clone(),
        });
        format!("Join request sent to {}", host_chain_id)
    }

    async fn make_move(&self, chess_move: ChessMove) -> String {
        self.runtime
            .schedule_operation(&Operation::MakeMove { chess_move });
        "Move scheduled".to_string()
    }

    async fn resign_match(&self) -> String {
        self.runtime.schedule_operation(&Operation::ResignMatch);
        "Resignation scheduled".to_string()
    }

    async fn end_game(&self, status: MatchStatus) -> String {
        self.runtime.schedule_operation(&Operation::EndGame { status });
        "Game end scheduled".to_string()
    }
}
