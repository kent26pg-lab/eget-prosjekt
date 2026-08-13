import { useState } from "react";

import { ThemeProvider } from "./Components/ThemeProvider";
import Header from "./Components/Header";
import WelcomeSection from "./Components/WelcomeSection";
import Login from "./Components/Login";
import BottomBar from "./Components/BottomBar";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
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

          <WelcomeSection />

          <BottomBar onLogout={handleLogout} />
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;