import { useState } from "react";

import { ThemeProvider } from "./Components/ThemeProvider";
import Header from "./Components/Header";
import WelcomeSection from "./Components/WelcomeSection";
import Login from "./Components/Login";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  function handleLogin() {
    setIsLoggedIn(true);
  }

  return (
    <ThemeProvider>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="app">
          <Header />
          <WelcomeSection />
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;