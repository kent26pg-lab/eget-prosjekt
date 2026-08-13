import { useEffect, useState } from "react";
import styles from "./ClockCard.module.css";

const STORAGE_KEY = "clockCardData";

function getToday() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const defaultData = {
  currentDay: null,
  history: [],
};

function getStoredData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultData;
  }

  try {
    const parsed = JSON.parse(saved);

    // Støtter også gammel lagring
    if (!parsed.currentDay && parsed.status) {
      return {
        currentDay: {
          date: getToday(),
          totalWorked: parsed.totalWorked || 0,
          workStart: parsed.workStart || null,
          pauseStart: parsed.pauseStart || null,
          status: parsed.status || "notStarted",
          registrations: parsed.registrations || [],
        },
        history: [],
      };
    }

    return {
      currentDay: parsed.currentDay || null,
      history: parsed.history || [],
    };
  } catch {
    return defaultData;
  }
}

function ClockCard() {
  const [data, setData] = useState(getStoredData);

  const [now, setNow] = useState(Date.now());

  const [showPausePopup, setShowPausePopup] =
    useState(false);

  const [showClockOutPopup, setShowClockOutPopup] =
    useState(false);

  const [pauseComment, setPauseComment] =
    useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }, [data]);

  function createNewDay() {
    const newDay = {
      date: getToday(),
      totalWorked: 0,
      workStart: null,
      pauseStart: null,
      status: "notStarted",
      registrations: [],
    };

    setData((previous) => ({
      ...previous,
      currentDay: newDay,
    }));

    return newDay;
  }

  function ensureToday() {
    const today = getToday();

    if (
      data.currentDay &&
      data.currentDay.date === today
    ) {
      return data.currentDay;
    }

    // Hvis vi har en gammel ferdig arbeidsdag,
    // flyttes den til historikken.
    if (data.currentDay) {
      setData((previous) => ({
        ...previous,
        history: [
          previous.currentDay,
          ...previous.history,
        ],
        currentDay: null,
      }));
    }

    return null;
  }

  function handleClockIn() {
    const today = getToday();

    let currentDay = data.currentDay;

    // Ny dato = ny arbeidsdag
    if (
      !currentDay ||
      currentDay.date !== today
    ) {
      currentDay = {
        date: today,
        totalWorked: 0,
        workStart: Date.now(),
        pauseStart: null,
        status: "working",
        registrations: [
          {
            type: "work",
            time: Date.now(),
          },
        ],
      };
    } else {
      currentDay = {
        ...currentDay,
        workStart: Date.now(),
        status: "working",
        registrations: [
          ...currentDay.registrations,
          {
            type: "work",
            time: Date.now(),
          },
        ],
      };
    }

    setData((previous) => {
      let history = previous.history;

      if (
        previous.currentDay &&
        previous.currentDay.date !== today
      ) {
        history = [
          previous.currentDay,
          ...history,
        ];
      }

      return {
        history,
        currentDay,
      };
    });
  }

  function handlePause() {
    if (
      !data.currentDay ||
      data.currentDay.status !== "working"
    ) {
      return;
    }

    setShowPausePopup(true);
  }

  function confirmPause() {
    const timestamp = Date.now();

    setData((previous) => ({
      ...previous,

      currentDay: {
        ...previous.currentDay,

        pauseStart: timestamp,
        status: "paused",

        registrations: [
          ...previous.currentDay.registrations,

          {
            type: "pause",
            time: timestamp,
            comment: pauseComment.trim(),
          },
        ],
      },
    }));

    setPauseComment("");
    setShowPausePopup(false);
  }

  function resumeWork() {
    if (
      !data.currentDay ||
      data.currentDay.status !== "paused"
    ) {
      return;
    }

    const timestamp = Date.now();

    const pauseDuration =
      timestamp -
      data.currentDay.pauseStart;

    setData((previous) => ({
      ...previous,

      currentDay: {
        ...previous.currentDay,

        totalWorked:
          previous.currentDay.totalWorked -
          pauseDuration,

        pauseStart: null,
        status: "working",

        registrations: [
          ...previous.currentDay.registrations,

          {
            type: "work",
            time: timestamp,
          },
        ],
      },
    }));
  }

  function handleClockOut() {
    if (!data.currentDay) {
      return;
    }

    setShowClockOutPopup(true);
  }

  function confirmClockOut() {
    if (!data.currentDay) {
      return;
    }

    const timestamp = Date.now();

    let totalWorked =
      data.currentDay.totalWorked;

    if (
      data.currentDay.status === "working" &&
      data.currentDay.workStart
    ) {
      totalWorked +=
        timestamp -
        data.currentDay.workStart;
    }

    if (
      data.currentDay.status === "paused"
    ) {
      const pauseDuration =
        timestamp -
        data.currentDay.pauseStart;

      totalWorked -= pauseDuration;
    }

    const finishedDay = {
      ...data.currentDay,

      totalWorked,

      status: "finished",

      workStart: null,
      pauseStart: null,

      registrations: [
        ...data.currentDay.registrations,

        {
          type: "clockOut",
          time: timestamp,
        },
      ],
    };

    setData((previous) => ({
      currentDay: finishedDay,
      history: previous.history,
    }));

    setShowClockOutPopup(false);
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

    const seconds = totalSeconds % 60;

    return `${hours} t ${String(minutes).padStart(
      2,
      "0"
    )} min ${String(seconds).padStart(
      2,
      "0"
    )} sek`;
  }

  const currentDay = data.currentDay;

  let totalWorked =
    currentDay?.totalWorked || 0;

  if (
    currentDay?.status === "working" &&
    currentDay.workStart
  ) {
    totalWorked +=
      now - currentDay.workStart;
  }

  const status = currentDay?.status || "notStarted";

  return (
    <>
      <section className={styles.card}>
        <div className={styles.workSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>
              Arbeidstid
            </span>

            <span
              className={`${styles.status} ${
                status === "working"
                  ? styles.statusWorking
                  : status === "paused"
                  ? styles.statusPaused
                  : styles.statusInactive
              }`}
            >
              {status === "working"
                ? "På jobb"
                : status === "paused"
                ? "Pause"
                : status === "finished"
                ? "Ferdig"
                : "Ikke stemplet inn"}
            </span>
          </div>

          <div className={styles.timeContainer}>
            <span className={styles.totalTime}>
              {formatDuration(totalWorked)}
            </span>

            <span className={styles.timeLabel}>
              Total arbeidstid
            </span>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.actionButton} ${styles.clockIn}`}
              type="button"
              onClick={handleClockIn}
              disabled={
                status === "working" ||
                status === "paused"
              }
            >
              Stemple inn
            </button>

            {status === "paused" ? (
              <button
                className={`${styles.actionButton} ${styles.pause}`}
                type="button"
                onClick={resumeWork}
              >
                Fortsett arbeid
              </button>
            ) : (
              <button
                className={`${styles.actionButton} ${styles.pause}`}
                type="button"
                onClick={handlePause}
                disabled={status !== "working"}
              >
                Sett på pause
              </button>
            )}

            <button
              className={`${styles.actionButton} ${styles.clockOut}`}
              type="button"
              onClick={handleClockOut}
              disabled={
                status !== "working" &&
                status !== "paused"
              }
            >
              Stemple ut
            </button>
          </div>
        </div>
      </section>

      {showPausePopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <span className={styles.eyebrow}>
                Pause
              </span>

              <h2>Sett på pause</h2>

              <p>
                Vil du legge til en kommentar?
              </p>
            </div>

            <div className={styles.inputGroup}>
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
                placeholder="Valgfri kommentar..."
                rows="4"
              />
            </div>

            <div className={styles.popupActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() =>
                  setShowPausePopup(false)
                }
              >
                Avbryt
              </button>

              <button
                className={styles.confirmButton}
                type="button"
                onClick={confirmPause}
              >
                Sett på pause
              </button>
            </div>
          </div>
        </div>
      )}

      {showClockOutPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <span className={styles.eyebrow}>
                Arbeidsdag
              </span>

              <h2>Stemple ut?</h2>

              <p>
                Er du sikker på at du vil avslutte
                arbeidsdagen?
              </p>
            </div>

            <div className={styles.popupActions}>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() =>
                  setShowClockOutPopup(false)
                }
              >
                Avbryt
              </button>

              <button
                className={styles.confirmButton}
                type="button"
                onClick={confirmClockOut}
              >
                Godkjenn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClockCard;