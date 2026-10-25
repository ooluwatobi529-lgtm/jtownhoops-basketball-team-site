
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import "./Styles/global.css";

import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// ============================================================
// J-TOWN HOOPS — APPLICATION ENTRY POINT
// ============================================================
//
// Provider order:
//
// 1. AuthProvider
//    Manages sign-in, JWT, cookies and user sessions.
//
// 2. ThemeProvider
//    Reads the signed-in user from AuthProvider.
//    Manages themes across desktop, tablet and mobile.
//    Supports future MongoDB theme synchronization.
//
// 3. App
//    Renders the J-Town Hoops website.
//
// IMPORTANT:
// Keep AuthProvider outside ThemeProvider because
// ThemeContext uses the useAuth() hook.
// ============================================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
