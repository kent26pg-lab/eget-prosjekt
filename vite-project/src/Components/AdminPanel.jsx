import { useEffect, useState } from "react";
import fakeBackend from "../services/fakeBackend";

import styles from "./AdminPanel.module.css";

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString(
    "nb-NO",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

function formatTime(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleTimeString(
    "nb-NO",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds <= 0) {
    return "0 t 00 min";
  }

  const totalMinutes = Math.floor(
    milliseconds / 60000,
  );

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes = totalMinutes % 60;

  return `${hours} t ${String(minutes).padStart(
    2,
    "0",
  )} min`;
}

function AdminPanel({ onBack }) {
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [selectedDetails, setSelectedDetails] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    setLoading(true);

    const adminUsers =
      fakeBackend.getAdminUsers();

    setUsers(
      adminUsers.filter(
        (user) => user.role !== "admin",
      ),
    );

    setLoading(false);
  }

  function openUser(user) {
    const details =
      fakeBackend.getAdminUserDetails(
        user.id,
      );

    setSelectedUser(user);
    setSelectedDetails(details);
  }

  function closeUser() {
    setSelectedUser(null);
    setSelectedDetails(null);
  }

  const activeUsers = users.filter(
    (user) => user.active,
  ).length;

  const loggedInUsers = users.filter(
    (user) => {
      if (!user.lastLogin) {
        return false;
      }

      if (!user.lastLogout) {
        return true;
      }

      return (
        new Date(user.lastLogin) >
        new Date(user.lastLogout)
      );
    },
  ).length;

  return (
    <div className={styles.adminPage}>
      {/* =========================
          HEADER
      ========================== */}

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            Administrator
          </span>

          <h1>Adminpanel</h1>

          <p>
            Oversikt over ansatte,
            innlogginger og arbeidstid.
          </p>
        </div>

        <button
          className={styles.backButton}
          type="button"
          onClick={onBack}
        >
          ← Tilbake
        </button>
      </header>

      {/* =========================
          OVERVIEW
      ========================== */}

      <section className={styles.overview}>
        <div className={styles.statCard}>
          <span>Ansatte</span>

          <strong>
            {users.length}
          </strong>
        </div>

        <div className={styles.statCard}>
          <span>Aktive kontoer</span>

          <strong>
            {activeUsers}
          </strong>
        </div>

        <div className={styles.statCard}>
          <span>Innlogget nå</span>

          <strong>
            {loggedInUsers}
          </strong>
        </div>
      </section>

      {/* =========================
          EMPLOYEES
      ========================== */}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <span className={styles.eyebrow}>
              Ansatte
            </span>

            <h2>
              Ansatte og kontoer
            </h2>
          </div>

          <button
            className={styles.refreshButton}
            type="button"
            onClick={loadUsers}
          >
            Oppdater
          </button>
        </div>

        {loading ? (
          <div className={styles.empty}>
            Laster ansatte...
          </div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            Ingen ansatte funnet.
          </div>
        ) : (
          <div className={styles.userList}>
            {users.map((user) => (
              <button
                key={user.id}
                className={styles.user}
                type="button"
                onClick={() =>
                  openUser(user)
                }
              >
                <div
                  className={
                    styles.userAvatar
                  }
                >
                  {user.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div
                  className={
                    styles.userInfo
                  }
                >
                  <strong>
                    {user.name}
                  </strong>

                  <span>
                    {user.username}
                  </span>
                </div>

                <div
                  className={
                    styles.userMeta
                  }
                >
                  <span
                    className={`${styles.status} ${
                      user.active
                        ? styles.active
                        : styles.inactive
                    }`}
                  >
                    {user.active
                      ? "Aktiv"
                      : "Inaktiv"}
                  </span>

                  <span
                    className={
                      styles.lastLogin
                    }
                  >
                    Sist innlogget:{" "}
                    {formatDate(
                      user.lastLogin,
                    )}{" "}
                    {formatTime(
                      user.lastLogin,
                    )}
                  </span>
                </div>

                <span
                  className={
                    styles.arrow
                  }
                >
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* =========================
          USER POPUP
      ========================== */}

      {selectedUser &&
        selectedDetails && (
          <div
            className={styles.overlay}
            onClick={closeUser}
          >
            <div
              className={styles.popup}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* HEADER */}

              <div
                className={
                  styles.popupHeader
                }
              >
                <div
                  className={
                    styles.popupAvatar
                  }
                >
                  {selectedUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <span
                    className={
                      styles.eyebrow
                    }
                  >
                    Ansatt
                  </span>

                  <h2>
                    {selectedUser.name}
                  </h2>

                  <p>
                    {
                      selectedUser.username
                    }
                  </p>
                </div>
              </div>

              {/* DETAILS */}

              <div
                className={
                  styles.userDetails
                }
              >
                <div>
                  <span>
                    Rolle
                  </span>

                  <strong>
                    Ansatt
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {selectedUser.active
                      ? "Aktiv"
                      : "Inaktiv"}
                  </strong>
                </div>

                <div>
                  <span>
                    Innlogginger
                  </span>

                  <strong>
                    {
                      selectedUser.loginCount
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Arbeidsdager
                  </span>

                  <strong>
                    {
                      selectedUser.workdayCount
                    }
                  </strong>
                </div>
              </div>

              {/* LOGIN HISTORY */}

              <div
                className={
                  styles.section
                }
              >
                <span
                  className={
                    styles.eyebrow
                  }
                >
                  Innlogginger
                </span>

                <h3>
                  Innloggingshistorikk
                </h3>

                {selectedDetails
                  .loginHistory
                  .length === 0 ? (
                  <p
                    className={
                      styles.empty
                    }
                  >
                    Ingen innlogginger
                    registrert.
                  </p>
                ) : (
                  <div
                    className={
                      styles.loginList
                    }
                  >
                    {selectedDetails.loginHistory.map(
                      (session) => (
                        <div
                          className={
                            styles.loginItem
                          }
                          key={
                            session.id
                          }
                        >
                          <div>
                            <strong>
                              {formatDate(
                                session.loginAt,
                              )}
                            </strong>

                            <span>
                              Innlogget{" "}
                              {formatTime(
                                session.loginAt,
                              )}
                            </span>
                          </div>

                          <div
                            className={
                              styles.logout
                            }
                          >
                            <span>
                              Utlogget
                            </span>

                            <strong>
                              {formatTime(
                                session.logoutAt,
                              )}
                            </strong>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* WORKDAYS */}

              <div
                className={
                  styles.section
                }
              >
                <span
                  className={
                    styles.eyebrow
                  }
                >
                  Arbeidstid
                </span>

                <h3>
                  Arbeidsdager
                </h3>

                {selectedDetails
                  .workdays
                  .length === 0 ? (
                  <p
                    className={
                      styles.empty
                    }
                  >
                    Ingen arbeidsdager
                    registrert.
                  </p>
                ) : (
                  <div
                    className={
                      styles.workdayList
                    }
                  >
                    {selectedDetails.workdays.map(
                      (day) => (
                        <div
                          className={
                            styles.workday
                          }
                          key={day.id}
                        >
                          <div>
                            <strong>
                              {formatDate(
                                day.date,
                              )}
                            </strong>

                            <span>
                              Inn:{" "}
                              {formatTime(
                                day.clockInAt,
                              )}
                            </span>

                            <span>
                              Ut:{" "}
                              {formatTime(
                                day.clockOutAt,
                              )}
                            </span>
                          </div>

                          <strong
                            className={
                              styles.workdayTotal
                            }
                          >
                            {formatDuration(
                              day.totalWorkedMs,
                            )}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* CLOSE */}

              <div
                className={
                  styles.popupActions
                }
              >
                <button
                  className={
                    styles.closeButton
                  }
                  type="button"
                  onClick={closeUser}
                >
                  Lukk
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default AdminPanel;