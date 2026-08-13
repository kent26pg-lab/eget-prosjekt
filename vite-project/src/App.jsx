import { useState } from "react";

import { ThemeProvider } from "./Components/ThemeProvider";
import Header from "./Components/Header";
import WelcomeSection from "./Components/WelcomeSection";
import Login from "./Components/Login";
import BottomBar from "./Components/BottomBar";
import ClockCard from "./Components/ClockCard";
import HistoryCard from "./Components/HistoryCard";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  function handleLogin() {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  }

  function handleLogout() {
    // Vi sletter kun innloggingsstatus.
    // Arbeidstid og historikk ligger fortsatt i localStorage.
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  }

  return (
    <ThemeProvider>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app">
          <Header />

          <main>
            <WelcomeSection />

            <div className="dashboard">
              <ClockCard />
              <HistoryCard />
            </div>
          </main>

          <BottomBar onLogout={handleLogout} />
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;