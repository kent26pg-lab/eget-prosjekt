const USERS_KEY = "fake_backend_users";
const SESSIONS_KEY = "fake_backend_sessions";
const WORKDAYS_KEY = "fake_backend_workdays";

/* =========================
   HELPERS
========================= */

function getData(key, fallback = []) {
  try {
    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================
   DEFAULT USERS
========================= */

function createDefaultUsers() {
  return [
    {
      id: "user-001",
      name: "Ola Nordmann",
      username: "ola",
      password: "1234",
      role: "employee",
      active: true,
    },

    {
      id: "user-002",
      name: "Kari Hansen",
      username: "kari",
      password: "1234",
      role: "employee",
      active: true,
    },

    {
      id: "user-003",
      name: "Per Olsen",
      username: "per",
      password: "1234",
      role: "employee",
      active: true,
    },

    {
      id: "admin-001",
      name: "Administrator",
      username: "admin",
      password: "admin123",
      role: "admin",
      active: true,
    },
  ];
}


/* =========================
   INITIALIZE
========================= */

function initialize() {
  const users = getData(
    USERS_KEY,
    null,
  );

  if (!users) {
    saveData(
      USERS_KEY,
      createDefaultUsers(),
    );
  }

  if (!localStorage.getItem(SESSIONS_KEY)) {
    saveData(SESSIONS_KEY, []);
  }

  if (!localStorage.getItem(WORKDAYS_KEY)) {
    saveData(WORKDAYS_KEY, []);
  }
}


/* =========================
   USERS
========================= */

function getUsers() {
  initialize();

  return getData(USERS_KEY);
}

function getUserById(userId) {
  return getUsers().find(
    (user) => user.id === userId,
  );
}

function getUserByUsername(username) {
  return getUsers().find(
    (user) =>
      user.username.toLowerCase() ===
      username.toLowerCase(),
  );
}


/* =========================
   LOGIN
========================= */

function login(username, password) {
  initialize();

  const users = getUsers();

  const user = users.find(
    (item) =>
      item.username.toLowerCase() ===
        username.toLowerCase() &&
      item.password === password &&
      item.active,
  );

  if (!user) {
    return {
      success: false,
      error:
        "Feil brukernavn eller passord.",
    };
  }

  const sessions = getData(
    SESSIONS_KEY,
  );

  const now = new Date().toISOString();

  const session = {
    id: createId("session"),
    userId: user.id,
    loginAt: now,
    logoutAt: null,
  };

  sessions.push(session);

  saveData(
    SESSIONS_KEY,
    sessions,
  );

  /*
    Vi returnerer ikke passordet
    til resten av appen.
  */

  const safeUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    active: user.active,
  };

  return {
    success: true,
    user: safeUser,
    sessionId: session.id,
  };
}


/* =========================
   LOGOUT
========================= */

function logout(sessionId) {
  initialize();

  const sessions = getData(
    SESSIONS_KEY,
  );

  const sessionIndex =
    sessions.findIndex(
      (session) =>
        session.id === sessionId,
    );

  if (sessionIndex === -1) {
    return {
      success: false,
      error: "Økten ble ikke funnet.",
    };
  }

  sessions[sessionIndex].logoutAt =
    new Date().toISOString();

  saveData(
    SESSIONS_KEY,
    sessions,
  );

  return {
    success: true,
  };
}


/* =========================
   LOGIN HISTORY
========================= */

function getLoginHistory(userId) {
  initialize();

  return getData(
    SESSIONS_KEY,
  )
    .filter(
      (session) =>
        session.userId === userId,
    )
    .sort(
      (a, b) =>
        new Date(b.loginAt) -
        new Date(a.loginAt),
    );
}


/* =========================
   WORKDAYS
========================= */

function getWorkdays(userId) {
  initialize();

  return getData(
    WORKDAYS_KEY,
  )
    .filter(
      (day) =>
        day.userId === userId,
    )
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date),
    );
}

function getTodayWorkday(userId) {
  const today = getToday();

  return getWorkdays(userId).find(
    (day) =>
      day.date === today,
  );
}


/* =========================
   CREATE WORKDAY
========================= */

function createWorkday(userId) {
  initialize();

  const workdays = getData(
    WORKDAYS_KEY,
  );

  const today = getToday();

  let workday = workdays.find(
    (day) =>
      day.userId === userId &&
      day.date === today,
  );

  if (workday) {
    return workday;
  }

  workday = {
    id: createId("workday"),

    userId,

    date: today,

    clockInAt: null,

    clockOutAt: null,

    totalWorkedMs: 0,

    currentStatus: "inactive",

    registrations: [],
  };

  workdays.push(workday);

  saveData(
    WORKDAYS_KEY,
    workdays,
  );

  return workday;
}


/* =========================
   CLOCK IN
========================= */

function clockIn(userId) {
  initialize();

  const workdays = getData(
    WORKDAYS_KEY,
  );

  const today = getToday();

  let workday = workdays.find(
    (day) =>
      day.userId === userId &&
      day.date === today,
  );

  if (!workday) {
    workday = createWorkday(
      userId,
    );

    const index =
      workdays.findIndex(
        (day) =>
          day.id === workday.id,
      );

    workdays[index] = workday;
  }

  if (
    workday.currentStatus ===
    "working"
  ) {
    return {
      success: false,
      error:
        "Du er allerede stemplet inn.",
    };
  }

  const now =
    new Date().toISOString();

  workday.clockInAt =
    workday.clockInAt || now;

  workday.currentStatus =
    "working";

  workday.registrations.push({
    id: createId("registration"),
    type: "clock-in",
    timestamp: now,
    comment: "",
  });

  saveData(
    WORKDAYS_KEY,
    workdays,
  );

  return {
    success: true,
    workday,
  };
}


/* =========================
   PAUSE
========================= */

function pause(userId, comment = "") {
  initialize();

  const workdays = getData(
    WORKDAYS_KEY,
  );

  const today = getToday();

  const workday =
    workdays.find(
      (day) =>
        day.userId === userId &&
        day.date === today,
    );

  if (!workday) {
    return {
      success: false,
      error:
        "Ingen aktiv arbeidsdag.",
    };
  }

  if (
    workday.currentStatus !==
    "working"
  ) {
    return {
      success: false,
      error:
        "Du kan bare ta pause når du arbeider.",
    };
  }

  const now =
    new Date().toISOString();

  workday.currentStatus =
    "paused";

  workday.registrations.push({
    id: createId("registration"),
    type: "pause",
    timestamp: now,
    comment: comment.trim(),
  });

  saveData(
    WORKDAYS_KEY,
    workdays,
  );

  return {
    success: true,
    workday,
  };
}


/* =========================
   RESUME
========================= */

function resume(userId) {
  initialize();

  const workdays = getData(
    WORKDAYS_KEY,
  );

  const today = getToday();

  const workday =
    workdays.find(
      (day) =>
        day.userId === userId &&
        day.date === today,
    );

  if (!workday) {
    return {
      success: false,
      error:
        "Ingen arbeidsdag funnet.",
    };
  }

  if (
    workday.currentStatus !==
    "paused"
  ) {
    return {
      success: false,
      error:
        "Du er ikke på pause.",
    };
  }

  const now =
    new Date().toISOString();

  workday.currentStatus =
    "working";

  workday.registrations.push({
    id: createId("registration"),
    type: "resume",
    timestamp: now,
    comment: "",
  });

  saveData(
    WORKDAYS_KEY,
    workdays,
  );

  return {
    success: true,
    workday,
  };
}


/* =========================
   CLOCK OUT
========================= */

function clockOut(userId) {
  initialize();

  const workdays = getData(
    WORKDAYS_KEY,
  );

  const today = getToday();

  const workday =
    workdays.find(
      (day) =>
        day.userId === userId &&
        day.date === today,
    );

  if (!workday) {
    return {
      success: false,
      error:
        "Ingen arbeidsdag funnet.",
    };
  }

  if (
    workday.currentStatus ===
    "inactive"
  ) {
    return {
      success: false,
      error:
        "Du er ikke stemplet inn.",
    };
  }

  const now =
    new Date().toISOString();

  /*
    Beregn arbeidstid ut fra
    registreringene.
  */

  let totalWorkedMs = 0;

  let workingStartedAt =
    workday.clockInAt;

  let paused = false;

  for (
    const registration of
      workday.registrations
  ) {
    const time = new Date(
      registration.timestamp,
    ).getTime();

    if (
      registration.type ===
      "pause"
    ) {
      if (
        workingStartedAt &&
        !paused
      ) {
        totalWorkedMs +=
          time -
          new Date(
            workingStartedAt,
          ).getTime();
      }

      paused = true;
    }

    if (
      registration.type ===
      "resume"
    ) {
      workingStartedAt =
        registration.timestamp;

      paused = false;
    }
  }

  if (
    workingStartedAt &&
    !paused
  ) {
    totalWorkedMs +=
      new Date(now).getTime() -
      new Date(
        workingStartedAt,
      ).getTime();
  }

  workday.totalWorkedMs =
    totalWorkedMs;

  workday.clockOutAt = now;

  workday.currentStatus =
    "inactive";

  workday.registrations.push({
    id: createId("registration"),
    type: "clock-out",
    timestamp: now,
    comment: "",
  });

  saveData(
    WORKDAYS_KEY,
    workdays,
  );

  return {
    success: true,
    workday,
    totalWorkedMs,
  };
}


/* =========================
   ADMIN
========================= */

function getAdminUsers() {
  initialize();

  return getUsers().map(
    (user) => {
      const sessions =
        getLoginHistory(user.id);

      const workdays =
        getWorkdays(user.id);

      const lastSession =
        sessions[0] || null;

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        active: user.active,

        lastLogin:
          lastSession?.loginAt ||
          null,

        lastLogout:
          lastSession?.logoutAt ||
          null,

        loginCount:
          sessions.length,

        workdayCount:
          workdays.length,
      };
    },
  );
}

function getAdminUserDetails(
  userId,
) {
  const user =
    getUserById(userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    active: user.active,

    loginHistory:
      getLoginHistory(userId),

    workdays:
      getWorkdays(userId),
  };
}


/* =========================
   EXPORT
========================= */

const fakeBackend = {
  initialize,

  getUsers,
  getUserById,
  getUserByUsername,

  login,
  logout,

  getLoginHistory,

  getWorkdays,
  getTodayWorkday,

  createWorkday,

  clockIn,
  pause,
  resume,
  clockOut,

  getAdminUsers,
  getAdminUserDetails,
};

initialize();

export default fakeBackend;