import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import styles from "./BottomBar.module.css";

function BottomBar({ onOpenAdmin }) {
  const { currentUser, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  function handleAdmin() {
    setMenuOpen(false);
    onOpenAdmin?.();
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  return (
    <nav
      className={`${styles.bottomBar} ${
        menuOpen ? styles.menuOpen : ""
      }`}
    >
      <div className={styles.barContent}>

        {/* =========================
            MENYKNAPP
        ========================== */}

        <button
          type="button"
          className={styles.menuButton}
          onClick={() =>
            setMenuOpen((current) => !current)
          }
          aria-label={
            menuOpen
              ? "Lukk meny"
              : "Åpne meny"
          }
          aria-expanded={menuOpen}
        >
          <span className={styles.menuIcon}>
            {menuOpen ? "×" : "☰"}
          </span>
        </button>


        {/* =========================
            MENY
        ========================== */}

        {menuOpen && (
          <div className={styles.menu}>

            {/* ADMIN */}

            {currentUser?.role === "admin" && (
              <button
                type="button"
                className={styles.menuItem}
                onClick={handleAdmin}
              >
                <span className={styles.icon}>
                  ⚙
                </span>

                <span>
                  Admin
                </span>
              </button>
            )}


            {/* LOGG UT */}

            <button
              type="button"
              className={styles.menuItem}
              onClick={handleLogout}
            >
              <span className={styles.icon}>
                ↪
              </span>

              <span>
                Logg ut
              </span>
            </button>

          </div>
        )}

      </div>
    </nav>
  );
}

export default BottomBar;