import { ThemeProvider } from "./Components/ThemeProvider";
import Header from "./Components/Header";
import WelcomeSection from "./Components/WelcomeSection";

import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
        <WelcomeSection />
      </div>
    </ThemeProvider>
  );
}

export default App;
