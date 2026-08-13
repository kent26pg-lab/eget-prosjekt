import { useEffect, useState } from "react";
import styles from "./HistoryCard.module.css";

const STORAGE_KEY = "clockCardData";

const emptyData = {
  currentDay: null,
  history: [],
};

function getStoredData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return emptyData;
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      currentDay: parsed.currentDay || null,
      history: parsed.history || [],
    };
  } catch {
    return emptyData;
  }
}

function HistoryCard() {
  const [data, setData] = useState(getStoredData);

  const [showHistory, setShowHistory] =
    useState(false);

  const [selectedDay, setSelectedDay] =
    useState(null);

  useEffect(() => {
    function updateHistory() {
      setData(getStoredData());
    }

    const interval = setInterval(
      updateHistory,
      500
    );

    window.addEventListener(
      "storage",
      updateHistory
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "storage",
        updateHistory
      );
    };
  }, []);

  function formatTime(timestamp) {
    if (!timestamp) {
      return "--:--";
    }

    return new Date(timestamp).toLocaleTimeString(
      "nb-NO",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(
      `${dateString}T12:00:00`
    );

    return date.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatShortDate(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(
      `${dateString}T12:00:00`
    );

    return date.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    });
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.max(
      0,
      Math.floor(milliseconds / 1000)
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

  function openHistory() {
    setSelectedDay(null);
    setShowHistory(true);
  }

  function closeHistory() {
    setShowHistory(false);
    setSelectedDay(null);
  }

  function selectDay(day) {
    setSelectedDay(day);
  }

  function getHistoryDays() {
    return [...data.history].sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );
  }

  const currentDay = data.currentDay;

  const registrations =
    currentDay?.registrations || [];

  const historyDays = getHistoryDays();

  return (
    <>
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
            TOTAL
        ========================== */}

        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>
            Total arbeidstid
          </span>

          <span className={styles.totalTime}>
            {formatDuration(
              currentDay?.totalWorked || 0
            )}
          </span>
        </div>

        {/* =========================
            TODAY
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
                    registration.time ||
                    registration.start;

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
                            className={
                              styles.time
                            }
                          >
                            {formatTime(
                              timestamp
                            )}
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
                              {
                                registration.comment
                              }
                            </p>
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* =========================
              PREVIOUS DAYS BUTTON
          ========================== */}

          {historyDays.length > 0 && (
            <button
              className={
                styles.historyButton
              }
              type="button"
              onClick={openHistory}
            >
              <span>
                Tidligere dager
              </span>

              <span
                className={
                  styles.historyArrow
                }
              >
                →
              </span>
            </button>
          )}
        </div>
      </section>

      {/* =========================
          HISTORY POPUP
      ========================== */}

      {showHistory && (
        <div
          className={styles.popupOverlay}
          onClick={closeHistory}
        >
          <div
            className={styles.popup}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {!selectedDay ? (
              <>
                <div
                  className={
                    styles.popupHeader
                  }
                >
                  <span
                    className={styles.eyebrow}
                  >
                    Historikk
                  </span>

                  <h2>
                    Tidligere dager
                  </h2>

                  <p>
                    Velg en arbeidsdag for å se
                    registreringene.
                  </p>
                </div>

                <div
                  className={
                    styles.dayList
                  }
                >
                  {historyDays.map(
                    (day) => (
                      <button
                        className={
                          styles.dayButton
                        }
                        type="button"
                        key={day.date}
                        onClick={() =>
                          selectDay(day)
                        }
                      >
                        <div
                          className={
                            styles.dayInfo
                          }
                        >
                          <span
                            className={
                              styles.dayDate
                            }
                          >
                            {formatDate(
                              day.date
                            )}
                          </span>

                          <span
                            className={
                              styles.dayDuration
                            }
                          >
                            {formatDuration(
                              day.totalWorked ||
                                0
                            )}
                          </span>
                        </div>

                        <span
                          className={
                            styles.dayArrow
                          }
                        >
                          →
                        </span>
                      </button>
                    )
                  )}
                </div>

                <div
                  className={
                    styles.popupActions
                  }
                >
                  <button
                    className={
                      styles.cancelButton
                    }
                    type="button"
                    onClick={closeHistory}
                  >
                    Lukk
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={
                    styles.popupHeader
                  }
                >
                  <button
                    className={
                      styles.backButton
                    }
                    type="button"
                    onClick={() =>
                      setSelectedDay(null)
                    }
                  >
                    ← Tilbake
                  </button>

                  <span
                    className={styles.eyebrow}
                  >
                    Arbeidsdag
                  </span>

                  <h2>
                    {formatShortDate(
                      selectedDay.date
                    )}
                  </h2>

                  <p>
                    {formatDate(
                      selectedDay.date
                    )}
                  </p>
                </div>

                <div
                  className={
                    styles.selectedTotal
                  }
                >
                  <span>
                    Total arbeidstid
                  </span>

                  <strong>
                    {formatDuration(
                      selectedDay.totalWorked ||
                        0
                    )}
                  </strong>
                </div>

                <div
                  className={
                    styles.selectedTimeline
                  }
                >
                  {(
                    selectedDay.registrations ||
                    []
                  ).map(
                    (
                      registration,
                      index
                    ) => {
                      const timestamp =
                        registration.time ||
                        registration.start;

                      return (
                        <div
                          className={
                            styles.item
                          }
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
                            className={
                              styles.content
                            }
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
                                className={
                                  styles.time
                                }
                              >
                                {formatTime(
                                  timestamp
                                )}
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
                                  {
                                    registration.comment
                                  }
                                </p>
                              )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                <div
                  className={
                    styles.popupActions
                  }
                >
                  <button
                    className={
                      styles.cancelButton
                    }
                    type="button"
                    onClick={closeHistory}
                  >
                    Lukk
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default HistoryCard;