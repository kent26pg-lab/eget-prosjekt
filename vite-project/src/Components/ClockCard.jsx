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

function sanitizeDay(day) {
  if (!day) {
    return null;
  }

  return {
    ...day,
    totalWorked: Math.max(
      0,
      Number(day.totalWorked) || 0,
    ),
    registrations: Array.isArray(
      day.registrations,
    )
      ? day.registrations
      : [],
  };
}

function getStoredData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultData;
  }

  try {
    const parsed = JSON.parse(saved);

    // Støtter gammel lagring
    if (!parsed.currentDay && parsed.status) {
      return {
        currentDay: sanitizeDay({
          date: getToday(),
          totalWorked: parsed.totalWorked || 0,
          workStart: parsed.workStart || null,
          pauseStart: parsed.pauseStart || null,
          status: parsed.status || "notStarted",
          registrations:
            parsed.registrations || [],
        }),
        history: Array.isArray(parsed.history)
          ? parsed.history.map(sanitizeDay)
          : [],
      };
    }

    return {
      currentDay: sanitizeDay(
        parsed.currentDay || null,
      ),
      history: Array.isArray(parsed.history)
        ? parsed.history
            .map(sanitizeDay)
            .filter(Boolean)
        : [],
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

  /* =========================
     CLOCK
  ========================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     SAVE
  ========================== */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data),
    );
  }, [data]);

  /* =========================
     CREATE NEW DAY
  ========================== */

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

  /* =========================
     CLOCK IN
  ========================== */

  function handleClockIn() {
    const today = getToday();

    const timestamp = Date.now();

    let currentDay = data.currentDay;

    /*
      Hvis det er en ny dato,
      opprettes en helt ny arbeidsdag.
    */

    if (
      !currentDay ||
      currentDay.date !== today
    ) {
      currentDay = {
        date: today,

        totalWorked: 0,

        workStart: timestamp,

        pauseStart: null,

        status: "working",

        registrations: [
          {
            type: "work",
            time: timestamp,
          },
        ],
      };
    } else {
      /*
        Hvis dagens arbeidsdag finnes,
        starter vi en ny arbeidsperiode.
      */

      currentDay = {
        ...currentDay,

        totalWorked: Math.max(
          0,
          currentDay.totalWorked || 0,
        ),

        workStart: timestamp,

        pauseStart: null,

        status: "working",

        registrations: [
          ...currentDay.registrations,

          {
            type: "work",
            time: timestamp,
          },
        ],
      };
    }

    setData((previous) => {
      let history = previous.history;

      /*
        Gammel dag flyttes automatisk
        til historikken.
      */

      if (
        previous.currentDay &&
        previous.currentDay.date !== today
      ) {
        history = [
          sanitizeDay(
            previous.currentDay,
          ),
          ...history,
        ];
      }

      return {
        history,

        currentDay,
      };
    });
  }

  /* =========================
     PAUSE
  ========================== */

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
    if (
      !data.currentDay ||
      data.currentDay.status !== "working" ||
      !data.currentDay.workStart
    ) {
      return;
    }

    const timestamp = Date.now();

    /*
      VIKTIG:

      Her avslutter vi arbeidsperioden.

      Alt arbeid fra workStart
      frem til pause legges til totalWorked.

      Pausetiden blir aldri en del
      av totalWorked.
    */

    const currentWorked =
      Math.max(
        0,
        timestamp -
          data.currentDay.workStart,
      );

    const previousTotal =
      Math.max(
        0,
        data.currentDay.totalWorked || 0,
      );

    const newTotal =
      previousTotal + currentWorked;

    setData((previous) => ({
      ...previous,

      currentDay: {
        ...previous.currentDay,

        totalWorked: newTotal,

        workStart: null,

        pauseStart: timestamp,

        status: "paused",

        registrations: [
          ...previous.currentDay.registrations,

          {
            type: "pause",

            time: timestamp,

            comment:
              pauseComment.trim(),
          },
        ],
      },
    }));

    setPauseComment("");

    setShowPausePopup(false);
  }

  /* =========================
     RESUME WORK
  ========================== */

  function resumeWork() {
    if (
      !data.currentDay ||
      data.currentDay.status !== "paused"
    ) {
      return;
    }

    const timestamp = Date.now();

    /*
      Vi skal IKKE trekke fra pausetiden.

      Total arbeidstid inneholder allerede
      alle ferdige arbeidsperioder.

      Nå starter vi bare en ny
      arbeidsperiode.
    */

    setData((previous) => ({
      ...previous,

      currentDay: {
        ...previous.currentDay,

        totalWorked: Math.max(
          0,
          previous.currentDay.totalWorked ||
            0,
        ),

        workStart: timestamp,

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

  /* =========================
     CLOCK OUT
  ========================== */

  function handleClockOut() {
    if (
      !data.currentDay ||
      (data.currentDay.status !==
        "working" &&
        data.currentDay.status !==
          "paused")
    ) {
      return;
    }

    setShowClockOutPopup(true);
  }

  function confirmClockOut() {
    if (!data.currentDay) {
      return;
    }

    const timestamp = Date.now();

    let totalWorked = Math.max(
      0,
      data.currentDay.totalWorked || 0,
    );

    /*
      Hvis personen fortsatt jobber,
      må siste arbeidsperiode legges til.
    */

    if (
      data.currentDay.status === "working" &&
      data.currentDay.workStart
    ) {
      const currentWorked = Math.max(
        0,
        timestamp -
          data.currentDay.workStart,
      );

      totalWorked += currentWorked;
    }

    /*
      Hvis personen står på pause,
      skal vi IKKE legge til noe.

      Pausen er allerede utenfor
      arbeidstiden.
    */

    const finishedDay = {
      ...data.currentDay,

      totalWorked: Math.max(
        0,
        totalWorked,
      ),

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

  /* =========================
     FORMAT TIME
  ========================== */

  function formatDuration(milliseconds) {
    const safeMilliseconds = Math.max(
      0,
      Number(milliseconds) || 0,
    );

    const totalSeconds = Math.floor(
      safeMilliseconds / 1000,
    );

    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const seconds =
      totalSeconds % 60;

    return `${hours} t ${String(
      minutes,
    ).padStart(
      2,
      "0",
    )} min ${String(
      seconds,
    ).padStart(
      2,
      "0",
    )} sek`;
  }

  /* =========================
     CURRENT DAY
  ========================== */

  const currentDay = data.currentDay;

  /*
    Totalen består av:

    1. Tid fra tidligere arbeidsperioder
    2. + tiden siden siste innstempling
       dersom vi jobber akkurat nå

    Pause påvirker ikke klokken.
  */

  let totalWorked = Math.max(
    0,
    currentDay?.totalWorked || 0,
  );

  if (
    currentDay?.status === "working" &&
    currentDay.workStart
  ) {
    totalWorked += Math.max(
      0,
      now - currentDay.workStart,
    );
  }

  totalWorked = Math.max(
    0,
    totalWorked,
  );

  const status =
    currentDay?.status ||
    "notStarted";

  /* =========================
     RENDER
  ========================== */

  return (
    <>
      <section className={styles.card}>
        <div className={styles.workSection}>
          <div
            className={
              styles.sectionHeader
            }
          >
            <span
              className={styles.eyebrow}
            >
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

          <div
            className={
              styles.timeContainer
            }
          >
            <span
              className={
                styles.totalTime
              }
            >
              {formatDuration(
                totalWorked,
              )}
            </span>

            <span
              className={
                styles.timeLabel
              }
            >
              Total arbeidstid
            </span>
          </div>

          <div
            className={styles.actions}
          >
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
                disabled={
                  status !== "working"
                }
              >
                Sett på pause
              </button>
            )}

            <button
              className={`${styles.actionButton} ${styles.clockOut}`}
              type="button"
              onClick={
                handleClockOut
              }
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

      {/* =========================
          PAUSE POPUP
      ========================== */}

      {showPausePopup && (
        <div
          className={
            styles.popupOverlay
          }
        >
          <div
            className={styles.popup}
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
                Vil du legge til en
                kommentar?
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
                value={
                  pauseComment
                }
                onChange={(event) =>
                  setPauseComment(
                    event.target
                      .value,
                  )
                }
                placeholder="Valgfri kommentar..."
                rows="4"
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
                onClick={() =>
                  setShowPausePopup(
                    false,
                  )
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
                  confirmPause
                }
              >
                Sett på pause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          CLOCK OUT POPUP
      ========================== */}

      {showClockOutPopup && (
        <div
          className={
            styles.popupOverlay
          }
        >
          <div
            className={styles.popup}
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
                Stemple ut?
              </h2>

              <p>
                Er du sikker på at du
                vil avslutte
                arbeidsdagen?
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
                onClick={() =>
                  setShowClockOutPopup(
                    false,
                  )
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
                  confirmClockOut
                }
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