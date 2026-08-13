import { useTheme } from "./ThemeProvider";
import styles from "./ThemeToggle.module.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.button}
      onClick={toggleTheme}
      type="button"
      aria-label="Bytt tema"
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}

export default ThemeToggle;