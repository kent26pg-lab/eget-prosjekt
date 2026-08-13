import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./Components/ThemeProvider";
import AppContent from "./AppContent";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;