import { useEffect, useContext, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { LineraContext } from "../../context/LineraContext.jsx";
import { useToast } from "../../components/ToastContainer";
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
  const { showToast } = useToast();
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
      showToast("Move submitted successfully!", "success");
      // Move will trigger refresh automatically
    } catch (error) {
      console.error("Error making move:", error);
      showToast(`Move failed: ${error?.message || error}`, "error");
    }
  };

  const handleResign = async () => {
    if (window.confirm("Are you sure you want to resign?")) {
      try {
        await resignMatch();
        showToast("You have resigned from the game", "info");
      } catch (error) {
        console.error("Error resigning:", error);
        showToast(`Failed to resign: ${error?.message || error}`, "error");
      }
    }
  };

  const getPlayerColor = () => {
    if (!game || !chainId) return null;
    if (isHost) return "White";
    return "Black";
  };

  const isPlayerTurn = () => {
    if (!game) {
      console.log("isPlayerTurn: no game");
      return false;
    }
    
    const playerColor = getPlayerColor();
    if (!playerColor) {
      console.log("isPlayerTurn: no playerColor");
      return false;
    }
    
    // If currentTurn is not set, check if game just started (no moves yet)
    // In that case, White (host) should be able to move first
    if (!currentTurn) {
      const hasMoves = game.moveHistory && game.moveHistory.length > 0;
      if (!hasMoves && playerColor === "White" && isHost) {
        console.log("isPlayerTurn: game just started, White (host) can move");
        return true;
      }
      console.log("isPlayerTurn: no currentTurn and not initial move", { hasMoves, playerColor, isHost });
      return false;
    }
    
    // Normalize both to uppercase for comparison (currentTurn might be "WHITE" or "White")
    const normalizedPlayerColor = String(playerColor).toUpperCase();
    const normalizedCurrentTurn = String(currentTurn).toUpperCase();
    const result = normalizedPlayerColor === normalizedCurrentTurn;
    console.log("isPlayerTurn:", result, { playerColor, currentTurn, normalizedPlayerColor, normalizedCurrentTurn });
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
          <div className={styles.roomIdSection}>
            <div className={styles.room_id_label}>Share this Room ID:</div>
            <div className={styles.roomIdContainer}>
              <div className={styles.room_id}>{chainId}</div>
              <button
                className={styles.copyButton}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(chainId);
                    showToast("Room ID copied to clipboard!", "success");
                  } catch (err) {
                    showToast("Failed to copy room ID", "error");
                  }
                }}
                title="Copy Room ID"
              >
                📋 Copy
              </button>
            </div>
          </div>
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
