import { useState } from "react";

import { useAuth } from "./context/AuthContext";

import Login from "./Components/Login";
import Header from "./Components/Header";
import WelcomeSection from "./Components/WelcomeSection";
import ClockCard from "./Components/ClockCard";
import HistoryCard from "./Components/HistoryCard";
import BottomBar from "./Components/BottomBar";
import AdminPanel from "./Components/AdminPanel";

function AppContent() {
  const {
    currentUser,
    isLoggedIn,
  } = useAuth();

  const [showAdminPanel, setShowAdminPanel] =
    useState(false);

  /* =========================
     IKKE LOGGET INN
  ========================== */

  if (!isLoggedIn) {
    return <Login />;
  }

  /* =========================
     ADMINPANEL
  ========================== */

  if (
    currentUser?.role === "admin" &&
    showAdminPanel
  ) {
    return (
      <AdminPanel
        onBack={() =>
          setShowAdminPanel(false)
        }
      />
    );
  }

  /* =========================
     VANLIG APP
  ========================== */

  return (
    <div className="app">
      <Header />

      <WelcomeSection />

      <div className="cardsContainer">
        <ClockCard />
        <HistoryCard />
      </div>

      <BottomBar
        onOpenAdmin={() =>
          setShowAdminPanel(true)
        }
      />
    </div>
  );
}

export default AppContent;