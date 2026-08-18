import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { DemoModeProvider } from "./context/DemoModeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DemoModeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </DemoModeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
