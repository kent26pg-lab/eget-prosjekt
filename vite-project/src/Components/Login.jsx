import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import styles from "./Login.module.css";

function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const result = login(
      username.trim(),
      password,
    );

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    /*
      AuthContext oppdaterer:
      - currentUser
      - isLoggedIn
      - sessionId
      - localStorage

      Derfor trenger vi ikke gjøre noe
      mer her etter vellykket login.
    */

    setLoading(false);
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Timeføring
          </span>

          <h1>Logg inn</h1>

          <p>
            Logg inn for å registrere
            arbeidstiden din.
          </p>
        </div>

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
                setUsername(event.target.value)
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
                setPassword(event.target.value)
              }
              placeholder="Passord"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

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
      </div>
    </div>
  );
}

export default Login;