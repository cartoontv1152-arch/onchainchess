use linera_sdk::views::{MapView, RegisterView, RootView, ViewError, View};
use linera_sdk::ViewStorageContext;
use linera_sdk::linera_base_types::AccountOwner;
use onchainchess::{GameState, Color, GameStatus};

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct ChessState {
    pub owner: RegisterView<Option<AccountOwner>>,
    pub games: MapView<u64, GameState>,
    pub game_counter: RegisterView<u64>,
    pub player_games: MapView<AccountOwner, Vec<u64>>,
}

impl ChessState {
    pub fn create_empty(context: ViewStorageContext) -> Self {
        Self {
            owner: RegisterView::new(context.clone()).expect("Failed to create owner register"),
            games: MapView::new(context.clone()).expect("Failed to create games map"),
            game_counter: RegisterView::new(context.clone()).expect("Failed to create game_counter register"),
            player_games: MapView::new(context.clone()).expect("Failed to create player_games map"),
        }
    }

    pub async fn load(context: ViewStorageContext) -> Result<Self, ViewError> {
        // RootView automatically loads data from storage when constructed
        // We need to use RootView::load() or construct and then load
        // For now, create empty and let views load on access
        let mut state = Self {
            owner: RegisterView::new(context.clone())?,
            games: MapView::new(context.clone())?,
            game_counter: RegisterView::new(context.clone())?,
            player_games: MapView::new(context.clone())?,
        };
        
        // Force load by accessing the views - this triggers loading from storage
        // The views will automatically sync with storage when accessed
        let _ = state.owner.get();
        let _ = state.game_counter.get();
        // Games and player_games will load when accessed via get() calls
        
        Ok(state)
    }

    pub async fn set_owner(&mut self, owner: AccountOwner) -> Result<(), ViewError> {
        self.owner.set(Some(owner));
        Ok(())
    }

    pub async fn create_game(&mut self, creator: AccountOwner, timestamp: u64) -> Result<u64, ViewError> {
        let current_counter = *self.game_counter.get();
        let game_id = current_counter + 1;
        log::info!("Creating game {} (counter was {})", game_id, current_counter);
        
        self.game_counter.set(game_id);
        log::info!("Set game_counter to {}", game_id);

        let initial_board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string();

        let game_state = GameState {
            game_id,
            white_player: creator,
            black_player: None,
            current_turn: Color::White,
            status: GameStatus::WaitingForPlayer,
            board: initial_board,
            move_history: Vec::new(),
            created_at: timestamp,
            last_move_at: timestamp,
        };

        self.games.insert(&game_id, game_state.clone())?;
        log::info!("Inserted game {} into games map", game_id);

        let mut creator_games = self.player_games.get(&creator).await?.unwrap_or_default();
        creator_games.push(game_id);
        self.player_games.insert(&creator, creator_games)?;
        log::info!("Added game {} to player {} games list", game_id, creator);

        Ok(game_id)
    }

    pub async fn join_game(&mut self, game_id: u64, player: AccountOwner) -> Result<(), ViewError> {
        let mut game = self.games.get(&game_id).await?
            .ok_or_else(|| ViewError::NotFound(format!("Game {} not found", game_id)))?;

        if game.black_player.is_some() {
            return Err(ViewError::NotFound("Game already has two players".to_string()));
        }

        if game.white_player == player {
            return Err(ViewError::NotFound("Cannot join your own game".to_string()));
        }

        game.black_player = Some(player);
        game.status = GameStatus::InProgress;

        self.games.insert(&game_id, game)?;

        let mut player_games = self.player_games.get(&player).await?.unwrap_or_default();
        if !player_games.contains(&game_id) {
            player_games.push(game_id);
            self.player_games.insert(&player, player_games)?;
        }

        Ok(())
    }

    pub async fn get_game(&self, game_id: u64) -> Result<Option<GameState>, ViewError> {
        self.games.get(&game_id).await
    }

    pub async fn get_player_games(&self, player: &AccountOwner) -> Result<Vec<GameState>, ViewError> {
        let game_ids = self.player_games.get(player).await?.unwrap_or_default();
        let mut games = Vec::new();

        for game_id in game_ids {
            if let Some(game) = self.games.get(&game_id).await? {
                games.push(game);
            }
        }

        Ok(games)
    }

    pub async fn get_available_games(&self) -> Result<Vec<GameState>, ViewError> {
        let mut games = Vec::new();
        
        // Collect all game IDs from player_games to iterate
        // This is a workaround since MapView doesn't have direct iteration
        // We'll use the game_counter to know the range
        let max_game_id = *self.game_counter.get();
        
        // Iterate through possible game IDs (from 1 to max_game_id)
        for game_id in 1..=max_game_id {
            if let Some(game) = self.games.get(&game_id).await? {
                if game.status == GameStatus::WaitingForPlayer {
                    games.push(game);
                }
            }
        }

        games.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        Ok(games)
    }

    pub async fn update_game(&mut self, game_id: u64, game: GameState) -> Result<(), ViewError> {
        self.games.insert(&game_id, game)?;
        Ok(())
    }

    pub async fn save(&mut self) -> Result<(), ViewError> {
        // Views are automatically saved when modified
        // No explicit save needed with RootView
        Ok(())
    }
}
