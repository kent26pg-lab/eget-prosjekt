import { useAuth } from "../context/AuthContext";

import styles from "./BottomBar.module.css";

function BottomBar({ onOpenAdmin }) {
  const { currentUser, logout } = useAuth();

  function handleAdmin() {
    if (currentUser?.role !== "admin") {
      return;
    }

    onOpenAdmin?.();
  }

  return (
    <nav className={styles.bottomBar}>
      <div className={styles.barContent}>

        {/* ADMIN */}

        {currentUser?.role === "admin" && (
          <button
            type="button"
            className={styles.barButton}
            onClick={handleAdmin}
          >
            <span className={styles.icon}>
              ⚙
            </span>

            <span className={styles.label}>
              Admin
            </span>
          </button>
        )}

        {/* LOGG UT */}

        <button
          type="button"
          className={`${styles.barButton} ${styles.logoutButton}`}
          onClick={logout}
        >
          <span className={styles.icon}>
            ↪
          </span>

          <span className={styles.label}>
            Logg ut
          </span>
        </button>

      </div>
    </nav>
  );
}

export default BottomBar;