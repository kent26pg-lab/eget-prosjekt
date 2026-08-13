import { useState } from "react";
import styles from "./BottomBar.module.css";

function BottomBar({
  currentUser,
  onLogout,
  onOpenAdmin,
}) {
  const [isHovered, setIsHovered] =
    useState(false);

  return (
    <>
      <nav
        className={`${styles.bottomBar} ${
          isHovered
            ? styles.expanded
            : styles.collapsed
        }`}
        onMouseEnter={() =>
          setIsHovered(true)
        }
        onMouseLeave={() =>
          setIsHovered(false)
        }
      >
        <div className={styles.barContent}>
          {currentUser?.role === "admin" && (
            <button
              type="button"
              className={styles.barButton}
              onClick={onOpenAdmin}
            >
              <span className={styles.icon}>
                ⚙
              </span>

              <span className={styles.label}>
                Adminpanel
              </span>
            </button>
          )}

          <button
            type="button"
            className={`${styles.barButton} ${styles.logoutButton}`}
            onClick={onLogout}
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
    </>
  );
}

export default BottomBar;