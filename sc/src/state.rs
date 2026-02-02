use linera_sdk::views::{linera_views, RegisterView, RootView, ViewStorageContext};
use doodle_game::{GameRoom, ArchivedRoom, Invitation, MatchmakingPlayer, LeaderboardEntry};

/// The application state for Doodle Game
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct DoodleGameState {
    // Game room data
    pub room: RegisterView<Option<GameRoom>>,
    // Current word (only stored on drawer's chain)
    pub current_word: RegisterView<Option<String>>,
    // Host chain ID that player is subscribed to (to prevent duplicate subscriptions)
    // Only used by players
    pub subscribed_to_host: RegisterView<Option<String>>,
    // Archived rooms history (for storing data after deletion)
    pub archived_rooms: RegisterView<Vec<ArchivedRoom>>,
    
    // Friend System
    pub friends: RegisterView<Vec<String>>,
    pub friend_requests_received: RegisterView<Vec<String>>,
    pub friend_requests_sent: RegisterView<Vec<String>>,
    
    // Invite System
    pub room_invitations: RegisterView<Vec<Invitation>>,
    pub sent_invitations: RegisterView<Vec<String>>, // Track sent invites to clear them on game start

    // Matchmaking
    pub matchmaking_queue: RegisterView<Vec<MatchmakingPlayer>>,
    pub last_notification: RegisterView<Option<String>>,
    pub matchmaking_queue_size: RegisterView<u32>,

    // Leaderboard
    pub leaderboard: RegisterView<Vec<LeaderboardEntry>>,
}