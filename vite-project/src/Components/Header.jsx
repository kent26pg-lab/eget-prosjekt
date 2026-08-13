import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Tidregistrering
      </div>

      <div className={styles.clock}>
        12:35
      </div>

      <button
        className={styles.themeButton}
        type="button"
        aria-label="Bytt tema"
      >
        ☾
      </button>
    </header>
  );
}

export default Header;