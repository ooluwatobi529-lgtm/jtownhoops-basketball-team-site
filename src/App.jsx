import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
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

import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  return (
    <Register
      onRegisterSuccess={(data) => {
        try {
          register(data);

          // Registration does NOT sign the person in.
          // Send them to Account so they can use the credentials just created.
          navigate(
            `/account?registered=1&email=${encodeURIComponent(data.email || "")}`
          );
        } catch (error) {
          // Register.jsx already performs its own form validation.
          // Re-throw so registration problems are not silently hidden.
          throw error;
        }
      }}
      onToggleLogin={() => navigate("/account")}
    />
  );
}

function Site() {
  const { user } = useAuth();

  return (
    <NotificationProvider user={user}>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/players" element={<Players />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/news" element={<News />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/support" element={<SupportUs />} />
        <Route path="/music" element={<Music />} />
        <Route path="/games" element={<Games />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/pictures" element={<Pictures />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/widget" element={<Widget />} />
        <Route path="/account" element={<Account />} />
        <Route path="/notifications" element={<Notifications user={user} />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
      </Routes>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Site />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
