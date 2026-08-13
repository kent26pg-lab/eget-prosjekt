import { useEffect, useState } from "react";
import styles from "./BottomBar.module.css";

function BottomBar({ onLogout }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleMouseMove(event) {
      const distanceFromBottom =
        window.innerHeight - event.clientY;

      setIsVisible(distanceFromBottom < 100);
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  function handleLogout() {
    onLogout();
  }

  return (
    <nav
      className={`${styles.bottomBar} ${
        isVisible ? styles.visible : ""
      }`}
    >
      <button
        className={styles.logout}
        type="button"
        onClick={handleLogout}
      >
        <span className={styles.icon}>↪</span>
        <span>Logg ut</span>
      </button>
    </nav>
  );
}

export default BottomBar;