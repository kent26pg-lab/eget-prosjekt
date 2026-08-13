import styles from "./Header.module.css";
import ThemeToggle from "./ThemeToggle";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Tidregistrering
      </div>

      <div className={styles.clock}>
        12:35
      </div>

      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;