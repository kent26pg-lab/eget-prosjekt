import { useState } from "react";
import styles from "./Login.module.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (email === "test@test.no" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
      return;
    }

    setError("Feil e-post eller passord.");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>
            Tidregistrering
          </span>

          <h1>Velkommen tilbake</h1>

          <p>
            Logg inn for å registrere og holde
            oversikt over tiden din.
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.field}>
            <label htmlFor="email">
              E-post
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="navn@eksempel.no"
              required
            />
          </div>

          <div className={styles.field}>
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
              placeholder="Skriv inn passord"
              required
            />
          </div>

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <button
            className={styles.button}
            type="submit"
          >
            Logg inn
          </button>
        </form>

        <span className={styles.demo}>
          Demo: test@test.no / 1234
        </span>
      </section>
    </main>
  );
}

export default Login;