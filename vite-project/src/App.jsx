import { useState } from "react";

import { ThemeProvider } from "./Components/ThemeProvider";
import Header from "./Components/Header";
import WelcomeSection from "./Components/WelcomeSection";
import Login from "./Components/Login";
import BottomBar from "./Components/BottomBar";
import ClockCard from "./Components/ClockCard";
import HistoryCard from "./Components/HistoryCard";
import AdminPanel from "./Components/AdminPanel";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true",
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("currentUser");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [showAdminPanel, setShowAdminPanel] =
    useState(false);

  /* =========================
     LOGIN
  ========================== */

  function handleLogin(user) {
    setCurrentUser(user);
    setIsLoggedIn(true);

    /*
      Admin skal også starte på
      den vanlige arbeidssiden.

      AdminPanel åpnes manuelt.
    */

    setShowAdminPanel(false);
  }

  /* =========================
     LOGOUT
  ========================== */

  function handleLogout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("isLoggedIn");

    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowAdminPanel(false);
  }

  /* =========================
     ADMIN PANEL
  ========================== */

  function openAdminPanel() {
    if (currentUser?.role !== "admin") {
      return;
    }

    setShowAdminPanel(true);
  }

  function closeAdminPanel() {
    setShowAdminPanel(false);
  }

  /* =========================
     LOGIN SCREEN
  ========================== */

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  /* =========================
     ADMIN PANEL
  ========================== */

  if (
    currentUser?.role === "admin" &&
    showAdminPanel
  ) {
    return (
      <ThemeProvider>
        <AdminPanel
          onBack={closeAdminPanel}
        />
      </ThemeProvider>
    );
  }

  /* =========================
     NORMAL APP
     
     Dette gjelder både:
     - ansatte
     - administrator
  ========================== */

  return (
    <ThemeProvider>
      <div className="app">
        <Header />

        <WelcomeSection />

        <div className="cardsContainer">
          <ClockCard />
          <HistoryCard />
        </div>

        <BottomBar
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAdmin={openAdminPanel}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;