import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { LineraContext } from "../../context/LineraContext.jsx";
import { useToast } from "../../components/ToastContainer";
import styles from "./styles.module.css";

const PLAYER_NAME_STORAGE_KEY = "chess_player_name";

const Home = () => {
  const navigate = useNavigate();
  const { ready, initError, chainId, createMatch } = useContext(LineraContext);
  const { showToast } = useToast();
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const [hostChainIdInput, setHostChainIdInput] = useState("");
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  const normalizedPlayerName = useMemo(
    () => String(playerName || "").trim(),
    [playerName]
  );

  const normalizedHostChainId = useMemo(
    () => String(hostChainIdInput || "").trim(),
    [hostChainIdInput]
  );

  const canJoin = useMemo(() => {
    if (!ready) return false;
    if (!normalizedHostChainId) return false;
    if (normalizedHostChainId === "matchmaking") return false;
    return true;
  }, [normalizedHostChainId, ready]);

  const canOpenMenus = normalizedPlayerName.length > 0;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>♟️ OnChain Chess</h1>
          <p className={styles.subtitle}>Decentralized Chess on Linera</p>
        </div>

        <div className={styles.content}>
          <div className={styles.name_block}>
            <input
              className={styles.input}
              value={playerName}
              onChange={(e) => {
                const next = e.target.value;
                setPlayerName(next);
                try {
                  localStorage.setItem(PLAYER_NAME_STORAGE_KEY, next);
                } catch { }
              }}
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.btn_container}>
            <Button
              name="Play with Friend"
              type="friend"
              disabled={!canOpenMenus}
              onClick={() => setFriendMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {friendMenuOpen && (
        <div
          className={styles.modal_backdrop}
          onClick={() => setFriendMenuOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <div className={styles.modal_title}>PLAY WITH FRIEND</div>
              <button
                className={styles.modal_close}
                type="button"
                onClick={() => setFriendMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            {!ready && (
              <div className={styles.modal_hint}>
                {initError ? `Linera init error: ${initError}` : "Initializing Linera..."}
              </div>
            )}

            {ready && (
              <>
                <div className={styles.section}>
                  <div className={styles.section_title}>CREATE ROOM</div>
                  <div className={styles.section_hint}>
                    Your room id:
                  </div>
                  <div className={styles.roomIdContainer}>
                    <span className={styles.mono}>{chainId}</span>
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
                  <Button
                    name="Create Room"
                    onClick={async () => {
                      try {
                        await createMatch(normalizedPlayerName);
                        showToast("Room created successfully!", "success");
                        setFriendMenuOpen(false);
                        navigate(`/room/${chainId}`);
                      } catch (error) {
                        showToast(`Failed to create room: ${error.message}`, "error");
                      }
                    }}
                  />
                </div>

                <div className={styles.divider} />

                <div className={styles.section}>
                  <div className={styles.section_title}>JOIN ROOM</div>
                  <div className={styles.section_hint}>
                    Enter host room id and join.
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      className={styles.input}
                      value={hostChainIdInput}
                      onChange={(e) => setHostChainIdInput(e.target.value)}
                      placeholder="Paste host room id here"
                    />
                    <button
                      className={styles.pasteButton}
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setHostChainIdInput(text);
                          showToast("Room ID pasted!", "success");
                        } catch (err) {
                          showToast("Failed to paste from clipboard", "error");
                        }
                      }}
                      title="Paste Room ID"
                    >
                      📥 Paste
                    </button>
                  </div>
                  <Button
                    name="Join Room"
                    disabled={!canJoin}
                    onClick={() => {
                      if (!canJoin) return;
                      setFriendMenuOpen(false);
                      const name = normalizedPlayerName;
                      const q = name ? `?name=${encodeURIComponent(name)}` : "";
                      showToast("Joining room...", "info");
                      navigate(`/room/${normalizedHostChainId}${q}`);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
