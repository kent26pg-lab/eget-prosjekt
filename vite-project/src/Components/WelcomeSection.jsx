import styles from "./WelcomeSection.module.css";

function WelcomeSection({ user }) {
  const hour = new Date().getHours();

  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "God formiddag";
  } else if (hour >= 12 && hour < 18) {
    greeting = "God ettermiddag";
  } else {
    greeting = "God kveld";
  }

  return (
    <section className={styles.welcome}>
      <span className={styles.greeting}>
        {greeting}, {user?.name}
      </span>

      <h1 className={styles.title}>
        Klar for å registrere tiden din?
      </h1>

      <p className={styles.description}>
        Her kan du enkelt stemple inn og ut
        og holde oversikt over arbeidstiden din.
      </p>
    </section>
  );
}

export default WelcomeSection;