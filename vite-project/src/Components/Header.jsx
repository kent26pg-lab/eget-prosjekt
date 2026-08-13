import { useEffect, useState } from "react";
import styles from "./Header.module.css";
import ThemeToggle from "./ThemeToggle";

function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        Tidregistrering
      </div>

      <div className={styles.clock}>
        {formattedTime}
      </div>

      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;