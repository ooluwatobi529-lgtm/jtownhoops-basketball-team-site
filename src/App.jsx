
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";

// ============================================================
// J-TOWN HOOPS PAGES
// ============================================================

import Home from "./pages/Home";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Schedule from "./pages/Schedule";
import News from "./pages/News";
import AboutUs from "./pages/AboutUs";
import Account from "./pages/Account";
import Games from "./pages/Games";
import Music from "./pages/Music";
import Widget from "./pages/Widget";
import Videos from "./pages/Videos";
import Pictures from "./pages/Pictures";
import Register from "./pages/Register";
import Notifications from "./pages/Notifications";
import AiAssistant from "./pages/AiAssistant";
import SupportUs from "./pages/SupportUs";

// PASSWORD RECOVERY PAGES
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ============================================================
// CONTEXT
//
// AuthProvider and ThemeProvider are already mounted
// in main.jsx, so DO NOT mount them again here.
// ============================================================

import {
  NotificationProvider,
} from "./context/NotificationContext";

import { useAuth } from "./context/AuthContext";

// ============================================================
// REGISTER PAGE WRAPPER
// ============================================================

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSuccess = async (data) => {
    try {
      await register(data);

      navigate(
        `/account?registered=1&email=${encodeURIComponent(
          data?.email || ""
        )}`
      );
    } catch (error) {
      console.error(
        "J-Town Hoops registration failed:",
        error
      );

      throw error;
    }
  };

  return (
    <Register
      onRegisterSuccess={handleRegisterSuccess}
      onToggleLogin={() => {
        navigate("/account");
      }}
    />
  );
}

// ============================================================
// MAIN J-TOWN HOOPS WEBSITE
// ============================================================

function Site() {
  const { user } = useAuth();

  return (
    <NotificationProvider user={user}>
      {/* ================================================
          GLOBAL NAVBAR
          ================================================ */}

      <Navbar />

      {/* ================================================
          WEBSITE ROUTES
          ================================================ */}

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* TEAMS */}
        <Route
          path="/teams"
          element={<Teams />}
        />

        {/* PLAYERS */}
        <Route
          path="/players"
          element={<Players />}
        />

        {/* SCHEDULE */}
        <Route
          path="/schedule"
          element={<Schedule />}
        />

        {/* NEWS */}
        <Route
          path="/news"
          element={<News />}
        />

        {/* ABOUT US */}
        <Route
          path="/aboutus"
          element={<AboutUs />}
        />

        {/* SUPPORT US */}
        <Route
          path="/support"
          element={<SupportUs />}
        />

        {/* SUPPORT US ALTERNATIVE URL */}
        <Route
          path="/support-us"
          element={<SupportUs />}
        />

        {/* MUSIC */}
        <Route
          path="/music"
          element={<Music />}
        />

        {/* GAMES */}
        <Route
          path="/games"
          element={<Games />}
        />

        {/* VIDEOS */}
        <Route
          path="/videos"
          element={<Videos />}
        />

        {/* PICTURES */}
        <Route
          path="/pictures"
          element={<Pictures />}
        />

        {/* REGISTRATION */}
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* WIDGET */}
        <Route
          path="/widget"
          element={<Widget />}
        />

        {/* ACCOUNT / SIGN IN */}
        <Route
          path="/account"
          element={<Account />}
        />

        {/* FORGOT PASSWORD */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* RESET PASSWORD */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={<Notifications user={user} />}
        />

        {/* AI ASSISTANT */}
        <Route
          path="/ai-assistant"
          element={<AiAssistant />}
        />

        {/* AI ASSISTANT ALTERNATIVE URL */}
        <Route
          path="/aiassistant"
          element={<AiAssistant />}
        />
      </Routes>
    </NotificationProvider>
  );
}

// ============================================================
// ROOT APPLICATION
//
// main.jsx provides:
//
// <AuthProvider>
//   <ThemeProvider>
//     <App />
//   </ThemeProvider>
// </AuthProvider>
//
// App.jsx only provides the router and site content.
// ============================================================

export default function App() {
  return (
    <Router>
      <Site />
    </Router>
  );
}
