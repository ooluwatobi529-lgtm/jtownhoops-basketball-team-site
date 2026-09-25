import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, X, Search, UserCircle, Bell, Trophy, Calendar, Home,
  Users, User, Bot, Mic, ShieldCheck, Palette, Check, ChevronDown
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const PROFILE_PREFIX = "jtown_hoops_profile_v2::";

const getProfileKey = (user) => {
  const email = String(user?.email || "").trim().toLowerCase();
  return email ? `${PROFILE_PREFIX}${email}` : null;
};

export default function Navbar({ searchData = [] }) {
  const { user, isAdmin } = useAuth();
  const {
    notificationFeed, unreadCount, markAsRead, markAllRead, isSignedIn
  } = useNotifications();
  const { theme, themes, setTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [profile, setProfile] = useState({ name: "", avatar: "", role: "User" });

  const notificationRef = useRef(null);
  const themeRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadProfile = () => {
    if (!user?.email) {
      setProfile({ name: "", avatar: "", role: "User" });
      return;
    }

    const key = getProfileKey(user);

    try {
      const saved = key
        ? JSON.parse(localStorage.getItem(key) || "{}")
        : {};

      setProfile({
        ...saved,
        name:
          saved.name ||
          user.name ||
          user.fullName ||
          user.teamName ||
          user.managerFullName ||
          "Account",
        role: isAdmin
          ? "Admin"
          : saved.role || user.role || user.accountType || "User",
        avatar: saved.avatar || "",
      });
    } catch {
      setProfile({
        name:
          user.name ||
          user.fullName ||
          user.teamName ||
          user.managerFullName ||
          "Account",
        avatar: "",
        role: isAdmin
          ? "Admin"
          : user.role || user.accountType || "User",
      });
    }
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = (event) => {
      const currentEmail = String(user?.email || "").trim().toLowerCase();
      const eventEmail = String(event?.detail?.email || "").trim().toLowerCase();
      const updatedProfile = event?.detail?.profile;

      if (updatedProfile && eventEmail && eventEmail === currentEmail) {
        setProfile(updatedProfile);
        return;
      }

      loadProfile();
    };

    const handleStorage = () => loadProfile();

    window.addEventListener("jtown-profile-updated", handleProfileUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("jtown-profile-updated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [user?.email, user?.role, user?.accountType, isAdmin]);

  useEffect(() => {
    const refreshProfile = () => loadProfile();
    window.addEventListener("focus", refreshProfile);
    return () => window.removeEventListener("focus", refreshProfile);
  }, [user?.email, user?.role, user?.accountType, isAdmin]);

  useEffect(() => {
    setIsOpen(false);
    setShowNotifications(false);
    setShowThemes(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  useEffect(() => {
    const outside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemes(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const displayName =
    profile.name ||
    user?.name ||
    user?.fullName ||
    user?.teamName ||
    user?.managerFullName ||
    "Account";

  const displayRole = isAdmin
    ? "Admin"
    : (profile.role || user?.role || user?.accountType || "User");

  const pages = [
    { title: "Home", url: "/" },
    { title: "Teams", url: "/teams" },
    { title: "Players", url: "/players" },
    { title: "Schedule", url: "/schedule" },
    { title: "News", url: "/news" },
    { title: "Notifications", url: "/notifications" },
    { title: "About Us", url: "/aboutus" },
    { title: "Account", url: "/account" },
    { title: "AI Assistant", url: "/ai-assistant" },
  ];

  const suggestions = searchQuery.trim()
    ? [
        ...searchData.filter((x) =>
          x.title?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...pages
          .filter((x) =>
            x.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((x) => ({ ...x, category: "Page" })),
      ].slice(0, 8)
    : [];

  const goTo = (item) => {
    navigate(item.url);
    setSearchQuery("");
    setShowSuggestions(false);
    setIsOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (suggestions[0]) return goTo(suggestions[0]);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleNotifications = () => {
    if (!isSignedIn) return navigate("/account");
    setShowThemes(false);
    setShowNotifications((value) => !value);
  };

  const desktopClass = ({ isActive }) =>
    `jt-nav-item relative flex w-14 flex-col items-center justify-center rounded-lg px-1 py-1 text-center transition-all duration-300 ${
      isActive ? "jt-nav-active" : "text-white hover:bg-neutral-900/60"
    }`;

  const mobileClass = ({ isActive }) =>
    `jt-mobile-nav flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
      isActive
        ? "jt-mobile-nav-active"
        : "border-transparent text-neutral-200 hover:bg-neutral-900"
    }`;

  return (
    <nav className="sticky top-0 z-[999999] overflow-visible border-b border-neutral-900 bg-black text-white shadow-md">
      <style>{`
        @keyframes logoBounceGlow {
          0%,100% { transform:translateY(0) scale(1); }
          50% {
            transform:translateY(-5px) scale(1.05);
            filter:drop-shadow(0 0 18px rgba(var(--jt-accent-rgb),.75));
          }
        }
        .logo-fx { animation:logoBounceGlow .9s ease-in-out infinite; }
        .logo-fx:hover { animation-play-state:paused; }

        @keyframes accountPulse {
          0%,100% { box-shadow:0 0 0 rgba(var(--jt-accent-rgb),0); }
          50% { box-shadow:0 0 14px rgba(var(--jt-accent-rgb),.28); }
        }
        .account-pulse { animation:accountPulse 1.8s ease-in-out infinite; }
        .account-pulse:hover { animation-play-state:paused; }
      `}</style>

      <div className="relative mx-auto max-w-7xl overflow-visible px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 overflow-visible">
          <Link to="/" className="relative flex shrink-0 items-center">
            <img
              src="/src/images/team-logo.jpg"
              alt="J-Town Hoops"
              className="logo-fx mt-2.5 h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg"
            />
          </Link>

          <form
            ref={searchRef}
            onSubmit={handleSearch}
            className="relative hidden max-w-md flex-1 sm:block"
          >
            <div className="relative mx-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                placeholder="Search J-Town Hoops..."
                className="jt-focus-border w-full rounded-full border border-neutral-800 bg-neutral-900 py-1.5 pl-10 pr-16 text-sm outline-none"
              />

              <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                <button type="button" className="jt-accent-hover p-1 text-gray-400">
                  <Mic className="h-4 w-4" />
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showSuggestions && searchQuery && (
                <div className="absolute left-0 right-0 top-full z-[1000002] mt-2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
                  {suggestions.length ? (
                    suggestions.map((result, index) => (
                      <button
                        key={`${result.url}-${index}`}
                        type="button"
                        onClick={() => goTo(result)}
                        className="flex w-full items-center justify-between border-b border-neutral-900 px-4 py-3 text-left hover:bg-neutral-900"
                      >
                        <span className="text-sm">{result.title}</span>
                        <span className="text-[10px] uppercase text-neutral-500">
                          {result.category || "Result"}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-neutral-500">
                      No suggestions
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          <div className="hidden items-center gap-3 md:flex">
            <NavLink to="/" end className={desktopClass}>
              <Home className="mb-1 h-4 w-4" />
              <span className="text-[11px]">Home</span>
            </NavLink>

            <NavLink to="/teams" className={desktopClass}>
              <Users className="mb-1 h-4 w-4" />
              <span className="text-[11px]">Teams</span>
            </NavLink>

            <NavLink to="/players" className={desktopClass}>
              <User className="mb-1 h-4 w-4" />
              <span className="text-[11px]">Players</span>
            </NavLink>

            <NavLink to="/schedule" className={desktopClass}>
              <Calendar className="mb-1 h-4 w-4" />
              <span className="text-[11px]">Schedule</span>
            </NavLink>

            <NavLink to="/ai-assistant" className={desktopClass}>
              <Bot className="mb-1 h-5 w-5 animate-pulse" />
              <span className="text-[11px]">AI Assist</span>
            </NavLink>

            <div className="h-8 w-px bg-neutral-800" />

            {/* MULTI-THEME SELECTOR */}
            <div ref={themeRef} className="relative z-[1000001]">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  setShowThemes((value) => !value);
                }}
                className={`jt-theme-button flex items-center gap-1.5 rounded-full border px-2.5 py-2 transition ${
                  showThemes ? "jt-theme-button-active" : ""
                }`}
                title={`Theme: ${theme.name}`}
              >
                <Palette className="h-5 w-5" />
                <ChevronDown
                  className={`h-3 w-3 transition ${showThemes ? "rotate-180" : ""}`}
                />
              </button>

              {showThemes && (
                <div className="absolute right-0 top-full z-[1000002] mt-3 w-72 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
                  <div className="border-b border-neutral-800 bg-black p-4">
                    <div className="flex items-center gap-2">
                      <Palette className="jt-accent-text h-5 w-5" />
                      <div>
                        <p className="text-sm font-black">J-Town Themes</p>
                        <p className="text-[10px] text-neutral-500">
                          Choose your arena style
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {themes.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setTheme(option.id);
                          setShowThemes(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-neutral-900 ${
                          theme.id === option.id ? "bg-neutral-900" : ""
                        }`}
                      >
                        <span className="text-lg">{option.emoji}</span>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black">{option.name}</p>
                          <div
                            className="mt-1 h-1.5 w-16 rounded-full"
                            style={{ backgroundColor: option.accent }}
                          />
                        </div>

                        {theme.id === option.id && (
                          <Check className="jt-accent-text h-4 w-4" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-neutral-800 px-4 py-3 text-[10px] text-neutral-500">
                    Saved automatically for your next visit.
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS */}
            <div ref={notificationRef} className="relative z-[1000001]">
              <button
                type="button"
                onClick={toggleNotifications}
                className={`jt-notification-button relative rounded-full p-2 transition ${
                  showNotifications ? "jt-notification-active" : "text-gray-300"
                }`}
              >
                <Bell className={`h-5 w-5 ${isSignedIn ? "" : "text-neutral-700"}`} />

                {isSignedIn && unreadCount > 0 && (
                  <span className="jt-accent-bg absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-black">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && isSignedIn && (
                <div className="absolute right-0 top-full z-[1000002] mt-3 w-96 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 bg-black p-3">
                    <div>
                      <p className="text-sm font-semibold">League Updates</p>
                      <p className="text-[10px] text-neutral-500">
                        J-Town Hoops Notifications
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="jt-accent-text text-[10px]">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 divide-y divide-neutral-900 overflow-y-auto">
                    {notificationFeed.length ? (
                      notificationFeed.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            markAsRead(item.id);
                            setShowNotifications(false);
                            navigate(item.link || "/notifications");
                          }}
                          className={`flex w-full gap-3 p-3.5 text-left hover:bg-neutral-900 ${
                            item.read ? "" : "jt-notification-unread"
                          }`}
                        >
                          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5">
                            {item.category === "games" ? (
                              <Trophy className="h-4 w-4 text-amber-500" />
                            ) : item.category === "schedule" ? (
                              <Calendar className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Bell className="jt-accent-text h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold">{item.title}</p>
                            <p className="mt-1 text-[11px] text-neutral-400">{item.desc}</p>
                            <p className="mt-1 text-[9px] text-neutral-600">{item.date}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-neutral-500">
                        No notifications yet.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/notifications");
                    }}
                    className="jt-accent-text w-full border-t border-neutral-800 p-4 font-semibold hover:bg-neutral-900"
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            {/* ACCOUNT deliberately remains Link, not NavLink */}
            <Link
              to="/account"
              className="account-pulse jt-account-button flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 transition hover:bg-neutral-800"
            >
              {user ? (
                <>
                  <div className="jt-accent-border flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-black">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle className="jt-accent-text h-6 w-6" />
                    )}
                  </div>

                  <div className="max-w-[100px] leading-tight">
                    <p className="truncate text-xs font-black text-white">
                      {displayName.split(" ")[0]}
                    </p>
                    <p className="jt-accent-text flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide">
                      {displayRole === "Admin" && <ShieldCheck size={10} />}
                      {displayRole}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UserCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Account</span>
                </>
              )}
            </Link>
          </div>

          {/* MOBILE TOP CONTROLS */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(false);
                setShowThemes((value) => !value);
              }}
              className="jt-accent-text rounded-md p-2"
              title="Choose theme"
            >
              <Palette className="h-5 w-5" />
            </button>

            <button
              onClick={toggleNotifications}
              className="relative rounded-md p-2 text-gray-300"
            >
              <Bell className="h-5 w-5" />
              {isSignedIn && unreadCount > 0 && (
                <span className="jt-accent-bg absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] text-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {user && (
              <Link
                to="/account"
                className="jt-accent-border flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border"
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="jt-accent-text h-6 w-6" />
                )}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-md p-2 text-gray-400 hover:bg-neutral-900 hover:text-white"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE THEME PANEL */}
      {showThemes && (
        <div className="absolute left-3 right-3 top-16 z-[1000003] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl md:hidden">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-black p-3">
            <div className="flex items-center gap-2">
              <Palette className="jt-accent-text h-4 w-4" />
              <b className="text-sm">J-Town Themes</b>
            </div>
            <button onClick={() => setShowThemes(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            {themes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setTheme(option.id);
                  setShowThemes(false);
                }}
                className={`rounded-xl border p-3 text-left transition ${
                  theme.id === option.id
                    ? "jt-accent-border bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option.emoji}</span>
                  {theme.id === option.id && (
                    <Check className="jt-accent-text h-4 w-4" />
                  )}
                </div>
                <p className="mt-2 text-[10px] font-black">{option.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MOBILE NOTIFICATIONS */}
      {showNotifications && isSignedIn && (
        <div className="absolute left-3 right-3 top-16 z-[1000002] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl md:hidden">
          <div className="flex justify-between border-b border-neutral-800 p-3">
            <b>Notifications</b>
            <button onClick={() => setShowNotifications(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-72 divide-y divide-neutral-900 overflow-y-auto">
            {notificationFeed.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  markAsRead(item.id);
                  setShowNotifications(false);
                  navigate(item.link || "/notifications");
                }}
                className="w-full p-4 text-left hover:bg-neutral-900"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowNotifications(false);
              navigate("/notifications");
            }}
            className="jt-accent-text w-full border-t border-neutral-800 p-4 font-semibold"
          >
            View All Notifications
          </button>
        </div>
      )}

      {/* MOBILE NAVIGATION */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 z-[999998] border-t border-neutral-900 bg-neutral-950 shadow-2xl md:hidden">
          <div className="space-y-2 px-4 py-5">
            <NavLink to="/" end className={mobileClass}>
              <Home className="h-4 w-4" /> Home
            </NavLink>
            <NavLink to="/teams" className={mobileClass}>
              <Users className="h-4 w-4" /> Teams
            </NavLink>
            <NavLink to="/players" className={mobileClass}>
              <User className="h-4 w-4" /> Players
            </NavLink>
            <NavLink to="/schedule" className={mobileClass}>
              <Calendar className="h-4 w-4" /> Schedule
            </NavLink>
            <NavLink to="/ai-assistant" className={mobileClass}>
              <Bot className="h-5 w-5" /> AI Assistant
            </NavLink>
            <NavLink to="/notifications" className={mobileClass}>
              <Bell className="h-5 w-5" /> Notifications
            </NavLink>

            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3"
            >
              <div className="jt-accent-border flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
                {user && profile.avatar ? (
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="jt-accent-text h-6 w-6" />
                )}
              </div>

              <div>
                <p className="font-black">
                  {user ? displayName : "Sign In / Register"}
                </p>
                {user && (
                  <p className="jt-accent-text text-[10px] font-bold uppercase">
                    {displayRole}
                  </p>
                )}
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
