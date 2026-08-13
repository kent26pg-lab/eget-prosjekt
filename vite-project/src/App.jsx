import { ThemeProvider } from "./Components/ThemeProvider";
import Header from "./Components/Header";

import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <Header />
      </div>
    </ThemeProvider>
  );
}

export default App;