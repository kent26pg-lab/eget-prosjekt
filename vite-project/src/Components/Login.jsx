import { useState } from "react";
import fakeBackend from "../services/fakeBackend";

import styles from "./Login.module.css";

function Login({ onLogin }) {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Skriv inn brukernavn og passord.",
      );

      return;
    }

    setLoading(true);

    /*
      Fake backend håndterer
      selve innloggingen.
    */

    const result =
      fakeBackend.login(
        username.trim(),
        password,
      );

    setLoading(false);

    if (!result.success) {
      setError(result.error);

      return;
    }

    /*
      Lagre den innloggede brukeren
      og session-ID slik at appen
      kan bruke dem videre.
    */

    localStorage.setItem(
      "currentUser",
      JSON.stringify(result.user),
    );

    localStorage.setItem(
      "sessionId",
      result.sessionId,
    );

    localStorage.setItem(
      "isLoggedIn",
      "true",
    );

    onLogin(result.user);
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        {/* =========================
            HEADER
        ========================== */}

        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Velkommen
          </span>

          <h1>Logg inn</h1>

          <p>
            Logg inn for å fortsette til
            arbeidsområdet ditt.
          </p>
        </div>

        {/* =========================
            FORM
        ========================== */}

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.inputGroup}>
            <label htmlFor="username">
              Brukernavn
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value,
                )
              }
              placeholder="Brukernavn"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">
              Passord
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Passord"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* =========================
              ERROR
          ========================== */}

          {error && (
            <div
              className={styles.error}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* =========================
              LOGIN BUTTON
          ========================== */}

          <button
            className={styles.loginButton}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logger inn..."
              : "Logg inn"}
          </button>
        </form>

        {/* =========================
            TEST USERS
        ========================== */}

        <div className={styles.testUsers}>
          <span>
            Testbrukere
          </span>

          <p>
            Ansatt: <strong>ola</strong> /
            1234
          </p>

          <p>
            Admin: <strong>admin</strong> /
            admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;