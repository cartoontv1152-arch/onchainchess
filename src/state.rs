use linera_sdk::views::{RegisterView, RootView, ViewStorageContext};
use onchainchess::Game;

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct ChessState {
    pub game: RegisterView<Option<Game>>,
    pub my_ready: RegisterView<bool>,
    pub opponent_ready: RegisterView<bool>,
    pub last_notification: RegisterView<Option<String>>,
}
