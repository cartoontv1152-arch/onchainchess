import { useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LineraContext } from "../../context/LineraContext";
import Button from "../../components/Button";
import ChessBoard from "../../components/ChessBoard";
import styles from "./styles.module.css";

const Result = () => {
  const navigate = useNavigate();
  const { ready, game, isHost, chainId } = useContext(LineraContext);

  const didWin = useMemo(() => {
    if (!game || !chainId) return false;
    if (game.winnerChainId === chainId) return true;
    return false;
  }, [game, chainId]);

  const getResultText = () => {
    if (!game) return "Game Ended";
    if (game.status === "Ended") {
      if (didWin) return "🎉 YOU WIN! 🎉";
      if (game.winnerChainId) return "😔 YOU LOSE 😔";
      return "🤝 DRAW 🤝";
    }
    return "Game Ended";
  };

  if (!ready) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.result_card}>
        <div className={styles.title}>
          {getResultText()}
        </div>
        
        {game && (
          <div className={styles.gameInfo}>
            <div className={styles.players}>
              <div className={styles.player}>
                <span className={styles.playerLabel}>White:</span>
                <span className={styles.playerName}>
                  {game.players.find((p) => p.chainId === game.hostChainId)?.name || "Host"}
                </span>
              </div>
              <div className={styles.player}>
                <span className={styles.playerLabel}>Black:</span>
                <span className={styles.playerName}>
                  {game.players.find((p) => p.chainId !== game.hostChainId)?.name || "Guest"}
                </span>
              </div>
            </div>
            <div className={styles.moveCount}>
              Total Moves: {game.moveHistory?.length || 0}
            </div>
          </div>
        )}

        {game && (
          <div className={styles.boardWrapper}>
            <ChessBoard
              game={game}
              playerColor={isHost ? "White" : "Black"}
              onMove={null}
              isPlayerTurn={false}
            />
          </div>
        )}

        <div className={styles.btn_container}>
          <Button
            name="Back to Home"
            onClick={() => navigate("/")}
          />
        </div>
      </div>
    </div>
  );
};

export default Result;
