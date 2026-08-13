import { useEffect, useState } from "react";
import styles from "./ClockCard.module.css";

const STORAGE_KEY = "clockCardData";

function getInitialData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      status: "notStarted",
      workStart: null,
      pauseStart: null,
      totalWorked: 0,
      registrations: [],
    };
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {
      status: "notStarted",
      workStart: null,
      pauseStart: null,
      totalWorked: 0,
      registrations: [],
    };
  }
}

function ClockCard() {
  const [data, setData] = useState(getInitialData);

  const [showPausePopup, setShowPausePopup] =
    useState(false);

  const [showClockOutPopup, setShowClockOutPopup] =
    useState(false);

  const [pauseComment, setPauseComment] =
    useState("");

  /*
   * Lagrer arbeidsstatus i localStorage.
   * Dette gjør at arbeidstiden overlever
   * både logout og refresh.
   */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }, [data]);

  /*
   * Oppdater arbeidstiden hvert sekund
   * mens brukeren er stemplet inn.
   */
  useEffect(() => {
    if (
      data.status !== "working" ||
      !data.workStart
    ) {
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();

      setData((current) => ({
        ...current,

        totalWorked:
          current.totalWorked +
          (now - current.workStart),

        workStart: now,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [data.status, data.workStart]);

  /*
   * Formaterer arbeidstid.
   */
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

    const seconds = totalSeconds % 60;

    return `${hours} t ${String(minutes).padStart(
      2,
      "0"
    )} min ${String(seconds).padStart(2, "0")} sek`;
  }

  /*
   * STEMPLE INN
   */
  function handleClockIn() {
    const now = Date.now();

    setData((current) => ({
      ...current,

      status: "working",

      workStart: now,

      pauseStart: null,

      registrations: [
        ...current.registrations,

        {
          type: "work",
          start: now,
        },
      ],
    }));
  }

  /*
   * ÅPNE PAUSE
   */
  function handleOpenPause() {
    setPauseComment("");

    setShowPausePopup(true);
  }

  /*
   * START PAUSE
   */
  function handleStartPause() {
    const now = Date.now();

    setData((current) => {
      let updatedTotal = current.totalWorked;

      if (current.workStart) {
        updatedTotal +=
          now - current.workStart;
      }

      return {
        ...current,

        status: "paused",

        workStart: null,

        pauseStart: now,

        totalWorked: updatedTotal,

        registrations: [
          ...current.registrations,

          {
            type: "pause",

            start: now,

            comment: pauseComment.trim(),
          },
        ],
      };
    });

    setPauseComment("");

    setShowPausePopup(false);
  }

  /*
   * AVSLUTT PAUSE
   */
  function handleEndPause() {
    const now = Date.now();

    setData((current) => ({
      ...current,

      status: "working",

      workStart: now,

      pauseStart: null,

      registrations: [
        ...current.registrations,

        {
          type: "work",
          start: now,
        },
      ],
    }));
  }

  /*
   * AVBRYT PAUSE
   */
  function handleCancelPause() {
    setPauseComment("");

    setShowPausePopup(false);
  }

  /*
   * ÅPNE STEMPLE UT
   */
  function handleOpenClockOut() {
    setShowClockOutPopup(true);
  }

  /*
   * STEMPLE UT
   */
  function handleClockOut() {
    const now = Date.now();

    setData((current) => {
      let updatedTotal = current.totalWorked;

      if (
        current.status === "working" &&
        current.workStart
      ) {
        updatedTotal +=
          now - current.workStart;
      }

      return {
        ...current,

        status: "notStarted",

        workStart: null,

        pauseStart: null,

        totalWorked: updatedTotal,

        registrations: [
          ...current.registrations,

          {
            type: "clockOut",

            time: now,
          },
        ],
      };
    });

    setShowClockOutPopup(false);
  }

  /*
   * AVBRYT STEMPLE UT
   */
  function handleCancelClockOut() {
    setShowClockOutPopup(false);
  }

  const isWorking = data.status === "working";

  const isPaused = data.status === "paused";

  /*
   * Beregn tiden akkurat nå.
   */
  let displayedTotal = data.totalWorked;

  if (
    isWorking &&
    data.workStart
  ) {
    displayedTotal +=
      Date.now() - data.workStart;
  }

  return (
    <>
      <section className={styles.card}>
        {/* =========================
            STATUS
        ========================== */}

        <div className={styles.workSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>
              Arbeidsdag
            </span>

            <span
              className={`${styles.status} ${
                isWorking
                  ? styles.statusWorking
                  : isPaused
                    ? styles.statusPaused
                    : styles.statusInactive
              }`}
            >
              {isWorking
                ? "På jobb"
                : isPaused
                  ? "På pause"
                  : "Ikke stemplet inn"}
            </span>
          </div>

          {/* =========================
              ARBEIDSTID
          ========================== */}

          <div className={styles.timeContainer}>
            <span className={styles.totalTime}>
              {formatDuration(displayedTotal)}
            </span>

            <span className={styles.timeLabel}>
              totalt stemplet inn i dag
            </span>
          </div>

          {/* =========================
              KNAPPER
          ========================== */}

          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${styles.clockIn}`}
              type="button"
              onClick={handleClockIn}
              disabled={
                isWorking || isPaused
              }
            >
              Stemple inn
            </button>

            <button
              className={`${styles.actionButton} ${styles.pause}`}
              type="button"
              onClick={
                isPaused
                  ? handleEndPause
                  : handleOpenPause
              }
              disabled={
                !isWorking && !isPaused
              }
            >
              {isPaused
                ? "Avslutt pause"
                : "Sett på pause"}
            </button>

            <button
              className={`${styles.actionButton} ${styles.clockOut}`}
              type="button"
              onClick={
                handleOpenClockOut
              }
              disabled={
                !isWorking && !isPaused
              }
            >
              Stemple ut
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          PAUSE POPUP
      ========================== */}

      {showPausePopup && (
        <div
          className={styles.popupOverlay}
          onMouseDown={
            handleCancelPause
          }
        >
          <div
            className={styles.popup}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.popupHeader
              }
            >
              <span
                className={
                  styles.eyebrow
                }
              >
                Pause
              </span>

              <h2>
                Sett på pause
              </h2>

              <p>
                Du kan legge til en
                kommentar hvis du ønsker.
              </p>
            </div>

            <div
              className={
                styles.inputGroup
              }
            >
              <label htmlFor="pauseComment">
                Kommentar
              </label>

              <textarea
                id="pauseComment"
                value={pauseComment}
                onChange={(event) =>
                  setPauseComment(
                    event.target.value
                  )
                }
                placeholder="F.eks. lunsj"
                rows="3"
              />
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
                onClick={
                  handleCancelPause
                }
              >
                Avbryt
              </button>

              <button
                className={
                  styles.confirmButton
                }
                type="button"
                onClick={
                  handleStartPause
                }
              >
                Start pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          STEMPLE UT POPUP
      ========================== */}

      {showClockOutPopup && (
        <div
          className={styles.popupOverlay}
          onMouseDown={
            handleCancelClockOut
          }
        >
          <div
            className={styles.popup}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.popupHeader
              }
            >
              <span
                className={
                  styles.eyebrow
                }
              >
                Arbeidsdag
              </span>

              <h2>
                Vil du stemple ut?
              </h2>

              <p>
                Du har vært stemplet inn
                i totalt{" "}
                <strong>
                  {formatDuration(
                    displayedTotal
                  )}
                </strong>{" "}
                i dag.
              </p>
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
                onClick={
                  handleCancelClockOut
                }
              >
                Avbryt
              </button>

              <button
                className={
                  styles.confirmButton
                }
                type="button"
                onClick={
                  handleClockOut
                }
              >
                Stemple ut
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClockCard;