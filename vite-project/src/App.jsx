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

    if (user?.role === "admin") {
      setShowAdminPanel(true);
    } else {
      setShowAdminPanel(false);
    }
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
     ADMIN
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
     RENDER
  ========================== */

  return (
    <ThemeProvider>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : currentUser?.role === "admin" &&
        showAdminPanel ? (
        <AdminPanel
          onBack={closeAdminPanel}
        />
      ) : (
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
      )}
    </ThemeProvider>
  );
}

export default App;