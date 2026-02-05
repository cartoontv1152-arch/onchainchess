import { useEffect, useContext, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { LineraContext } from "../../context/LineraContext.jsx";
import ChessBoard from "../../components/ChessBoard";
import { squareToAlgebraic, algebraicToSquare } from "../../utils/chessUtils";
import styles from "./styles.module.css";

const PLAYER_NAME_STORAGE_KEY = "chess_player_name";

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    ready,
    initError,
    chainId,
    syncUnlocked,
    game,
    isHost,
    opponentChainId,
    currentTurn,
    matchStatus,
    makeMove,
    joinMatch,
    resignMatch,
  } = useContext(LineraContext);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!syncUnlocked) return;
    if (!id) return;
    if (id === "matchmaking") return;
    if (!chainId) return;

    if (id === chainId) {
      return;
    }

    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    const params = new URLSearchParams(location.search || "");
    let playerName = String(params.get("name") || "").trim();
    if (!playerName) {
      try {
        playerName = String(localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "").trim();
      } catch {
        playerName = "";
      }
    }
    joinMatch(id, playerName || undefined).catch(() => {
      hasJoinedRef.current = false;
      navigate("/");
    });
  }, [chainId, id, joinMatch, location.search, navigate, ready, syncUnlocked]);

  useEffect(() => {
    if (!ready) return;
    if (id === "matchmaking") return;
    if (!syncUnlocked) return;
    if (!game) return;

    // Navigate to result if game ended
    if (game.status === "Ended") {
      navigate("/result");
    }
  }, [game, id, navigate, ready, syncUnlocked]);

  const handleMakeMove = async (chessMove) => {
    try {
      console.log("Handling move:", chessMove);
      await makeMove(chessMove);
      // Move will trigger refresh automatically
    } catch (error) {
      console.error("Error making move:", error);
      alert(`Move failed: ${error?.message || error}`);
    }
  };

  const handleResign = async () => {
    if (window.confirm("Are you sure you want to resign?")) {
      try {
        await resignMatch();
      } catch (error) {
        console.error("Error resigning:", error);
      }
    }
  };

  const getPlayerColor = () => {
    if (!game || !chainId) return null;
    if (isHost) return "White";
    return "Black";
  };

  const isPlayerTurn = () => {
    if (!game || !currentTurn) {
      console.log("isPlayerTurn: no game or currentTurn", { game: !!game, currentTurn });
      return false;
    }
    const playerColor = getPlayerColor();
    const result = playerColor === currentTurn;
    console.log("isPlayerTurn:", result, { playerColor, currentTurn });
    return result;
  };

  if (!ready) {
    return (
      <div className={styles.loading}>
        {initError ? `Linera init error: ${initError}` : "Initializing Linera..."}
      </div>
    );
  }

  if (!syncUnlocked) {
    return <div className={styles.loading}>Syncing chain...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
        <div className={styles.gameInfo}>
          {game && (
            <>
              <div className={styles.players}>
                <div className={`${styles.player} ${isHost ? styles.you : ""}`}>
                  <span className={styles.playerLabel}>White (Host):</span>
                  <span className={styles.playerName}>
                    {game.players.find((p) => p.chainId === game.hostChainId)?.name || "Host"}
                  </span>
                </div>
                {opponentChainId && (
                  <div className={`${styles.player} ${!isHost ? styles.you : ""}`}>
                    <span className={styles.playerLabel}>Black (Guest):</span>
                    <span className={styles.playerName}>
                      {game.players.find((p) => p.chainId === opponentChainId)?.name || "Guest"}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.status}>
                Status: <span className={styles.statusValue}>{game.status}</span>
              </div>
              {game.status === "Active" && (
                <div className={styles.turnIndicator}>
                  {isPlayerTurn() ? "✅ Your turn - Click or drag pieces!" : "⏳ Opponent's turn"}
                </div>
              )}
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                Debug: canMove={String(isPlayerTurn())}, status={game.status}, currentTurn={currentTurn || 'null'}
              </div>
            </>
          )}
        </div>
        {game && game.status === "Active" && (
          <button className={styles.resignButton} onClick={handleResign}>
            Resign
          </button>
        )}
      </div>

      {!opponentChainId && (
        <div className={styles.waiting}>
          <div className={styles.waiting_text}>Waiting for opponent to join...</div>
          <div className={styles.room_id}>Room ID: {chainId}</div>
        </div>
      )}

      {opponentChainId && game && (
        <div className={styles.gameArea}>
          <div className={styles.boardWrapper}>
            <ChessBoard
              game={game}
              playerColor={getPlayerColor()}
              onMove={handleMakeMove}
              isPlayerTurn={isPlayerTurn()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
