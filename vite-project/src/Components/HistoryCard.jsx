import { useEffect, useState } from "react";
import styles from "./HistoryCard.module.css";

const STORAGE_KEY = "clockCardData";

const emptyData = {
  status: "notStarted",
  workStart: null,
  pauseStart: null,
  totalWorked: 0,
  registrations: [],
};

function getStoredData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return emptyData;
  }

  try {
    return JSON.parse(saved);
  } catch {
    return emptyData;
  }
}

function HistoryCard() {
  const [data, setData] = useState(getStoredData);

  useEffect(() => {
    function updateHistory() {
      setData(getStoredData());
    }

    const interval = setInterval(updateHistory, 500);

    window.addEventListener("storage", updateHistory);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "storage",
        updateHistory
      );
    };
  }, []);

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString(
      "nb-NO",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(
      milliseconds / 1000
    );

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    return `${hours} t ${String(minutes).padStart(
      2,
      "0"
    )} min`;
  }

  function getTitle(registration) {
    if (registration.type === "work") {
      return "Innstempling";
    }

    if (registration.type === "pause") {
      return "Pause";
    }

    if (registration.type === "clockOut") {
      return "Utstempling";
    }

    return "Registrering";
  }

  function getDotClass(registration) {
    if (registration.type === "pause") {
      return styles.pauseDot;
    }

    if (registration.type === "clockOut") {
      return styles.clockOutDot;
    }

    return styles.workDot;
  }

  const registrations = data.registrations || [];

  return (
    <section className={styles.card}>
      {/* =========================
          HEADER
      ========================== */}

      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Historikk
          </span>

          <h2>I dag</h2>
        </div>

        <span className={styles.count}>
          {registrations.length}
        </span>
      </div>

      {/* =========================
          TOTAL ARBEIDSTID
      ========================== */}

      <div className={styles.totalSection}>
        <span className={styles.totalLabel}>
          Total arbeidstid
        </span>

        <span className={styles.totalTime}>
          {formatDuration(
            data.totalWorked || 0
          )}
        </span>
      </div>

      {/* =========================
          REGISTRERINGER
      ========================== */}

      <div className={styles.historySection}>
        {registrations.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              —
            </div>

            <p>
              Ingen registreringer ennå
            </p>

            <span>
              Registreringene dine vises her.
            </span>
          </div>
        ) : (
          <div className={styles.timeline}>
            {registrations.map(
              (registration, index) => {
                const timestamp =
                  registration.start ||
                  registration.time;

                return (
                  <div
                    className={styles.item}
                    key={`${timestamp}-${index}`}
                  >
                    <div
                      className={
                        styles.timelineLine
                      }
                    >
                      <span
                        className={`${styles.dot} ${getDotClass(
                          registration
                        )}`}
                      />
                    </div>

                    <div
                      className={styles.content}
                    >
                      <div
                        className={
                          styles.itemTop
                        }
                      >
                        <span
                          className={
                            styles.itemTitle
                          }
                        >
                          {getTitle(
                            registration
                          )}
                        </span>

                        <span
                          className={styles.time}
                        >
                          {formatTime(timestamp)}
                        </span>
                      </div>

                      {registration.type ===
                        "pause" &&
                        registration.comment && (
                          <p
                            className={
                              styles.comment
                            }
                          >
                            {registration.comment}
                          </p>
                        )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default HistoryCard;