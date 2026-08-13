import {
  createContext,
  useContext,
  useState,
} from "react";

import fakeBackend from "../services/fakeBackend";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => {
      try {
        const savedUser =
          localStorage.getItem("currentUser");

        return savedUser
          ? JSON.parse(savedUser)
          : null;
      } catch {
        return null;
      }
    },
  );

  const [isLoggedIn, setIsLoggedIn] = useState(
    () =>
      localStorage.getItem(
        "isLoggedIn",
      ) === "true",
  );

  const [sessionId, setSessionId] = useState(
    () =>
      localStorage.getItem(
        "sessionId",
      ) || null,
  );

  function login(username, password) {
    const result = fakeBackend.login(
      username,
      password,
    );

    if (!result.success) {
      return result;
    }

    setCurrentUser(result.user);
    setIsLoggedIn(true);
    setSessionId(result.sessionId);

    localStorage.setItem(
      "currentUser",
      JSON.stringify(result.user),
    );

    localStorage.setItem(
      "sessionId",
      result.sessionId,
    );

    localStorage.setItem(
      "isLoggedIn",
      "true",
    );

    return result;
  }

  function logout() {
    if (sessionId) {
      fakeBackend.logout(sessionId);
    }

    setCurrentUser(null);
    setIsLoggedIn(false);
    setSessionId(null);

    localStorage.removeItem(
      "currentUser",
    );

    localStorage.removeItem(
      "sessionId",
    );

    localStorage.removeItem(
      "isLoggedIn",
    );
  }

  const value = {
    currentUser,
    isLoggedIn,
    sessionId,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth må brukes inne i AuthProvider.",
    );
  }

  return context;
}

export default AuthContext;