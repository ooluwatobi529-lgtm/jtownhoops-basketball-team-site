import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  Search,
  UserCircle,
  Bell,
  Trophy,
  Calendar,
  Home,
  Users,
  User,
  Bot,
  Mic,
  ShieldCheck,
  Palette,
  Check,
  ChevronDown,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import jtownLogo from "../images/team-logo.jpg";

const PROFILE_PREFIX = "jtown_hoops_profile_v2::";

const getProfileKey = (user) => {
  const email = String(user?.email || "")
    .trim()
    .toLowerCase();

  return email
    ? `${PROFILE_PREFIX}${email}`
    : null;
};

export default function Navbar({
  searchData = [],
}) {
  const { user, isAdmin } = useAuth();

  const {
    notificationFeed,
    unreadCount,
    markAsRead,
    markAllRead,
    isSignedIn,
  } = useNotifications();

  const {
    theme,
    themes,
    setTheme,
  } = useTheme();

  const [isOpen, setIsOpen] =
    useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [showThemes, setShowThemes] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    avatar: "",
    role: "User",
  });

  const notificationRef = useRef(null);
  const themeRef = useRef(null);
  const searchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ============================================================
  // PROFILE
  // ============================================================

  const loadProfile = () => {
    if (!user?.email) {
      setProfile({
        name: "",
        avatar: "",
        role: "User",
      });

      return;
    }

    const key = getProfileKey(user);

    try {
      const saved = key
        ? JSON.parse(
            localStorage.getItem(key) ||
              "{}"
          )
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
          : saved.role ||
            user.role ||
            user.accountType ||
            "User",

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
          : user.role ||
            user.accountType ||
            "User",
      });
    }
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = (
      event
    ) => {
      const currentEmail = String(
        user?.email || ""
      )
        .trim()
        .toLowerCase();

      const eventEmail = String(
        event?.detail?.email || ""
      )
        .trim()
        .toLowerCase();

      const updatedProfile =
        event?.detail?.profile;

      if (
        updatedProfile &&
        eventEmail &&
        eventEmail === currentEmail
      ) {
        setProfile(updatedProfile);
        return;
      }

      loadProfile();
    };

    const handleStorage = () =>
      loadProfile();

    window.addEventListener(
      "jtown-profile-updated",
      handleProfileUpdate
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "jtown-profile-updated",
        handleProfileUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [
    user?.email,
    user?.role,
    user?.accountType,
    isAdmin,
  ]);

  useEffect(() => {
    const refreshProfile = () =>
      loadProfile();

    window.addEventListener(
      "focus",
      refreshProfile
    );

    return () =>
      window.removeEventListener(
        "focus",
        refreshProfile
      );
  }, [
    user?.email,
    user?.role,
    user?.accountType,
    isAdmin,
  ]);

  // ============================================================
  // CLOSE PANELS WHEN ROUTE CHANGES
  // ============================================================

  useEffect(() => {
    setIsOpen(false);
    setShowNotifications(false);
    setShowThemes(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // ============================================================
  // CLICK / TOUCH OUTSIDE
  // ============================================================

  useEffect(() => {
    const outside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }

      if (
        themeRef.current &&
        !themeRef.current.contains(
          event.target
        )
      ) {
        setShowThemes(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener(
      "mousedown",
      outside
    );

    document.addEventListener(
      "touchstart",
      outside,
      { passive: true }
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        outside
      );

      document.removeEventListener(
        "touchstart",
        outside
      );
    };
  }, []);

  // ============================================================
  // USER DISPLAY
  // ============================================================

  const displayName =
    profile.name ||
    user?.name ||
    user?.fullName ||
    user?.teamName ||
    user?.managerFullName ||
    "Account";

  const displayRole = isAdmin
    ? "Admin"
    : profile.role ||
      user?.role ||
      user?.accountType ||
      "User";

  // ============================================================
  // SEARCH
  // ============================================================

  const pages = [
    { title: "Home", url: "/" },
    { title: "Teams", url: "/teams" },
    {
      title: "Players",
      url: "/players",
    },
    {
      title: "Schedule",
      url: "/schedule",
    },
    { title: "News", url: "/news" },
    {
      title: "Notifications",
      url: "/notifications",
    },
    {
      title: "About Us",
      url: "/aboutus",
    },
    {
      title: "Account",
      url: "/account",
    },
    {
      title: "AI Assistant",
      url: "/ai-assistant",
    },
  ];

  const suggestions =
    searchQuery.trim()
      ? [
          ...searchData.filter((x) =>
            x.title
              ?.toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
          ),

          ...pages
            .filter((x) =>
              x.title
                .toLowerCase()
                .includes(
                  searchQuery.toLowerCase()
                )
            )
            .map((x) => ({
              ...x,
              category: "Page",
            })),
        ].slice(0, 8)
      : [];

  const goTo = (item) => {
    navigate(item.url);

    setSearchQuery("");
    setShowSuggestions(false);
    setIsOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    if (suggestions[0]) {
      return goTo(suggestions[0]);
    }

    if (searchQuery.trim()) {
      navigate(
        `/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );
    }
  };

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const toggleNotifications = () => {
    if (!isSignedIn) {
      return navigate("/account");
    }

    setShowThemes(false);

    setShowNotifications(
      (value) => !value
    );
  };

  // ============================================================
  // THEME
  // ============================================================

  const chooseTheme = (themeId) => {
    setTheme(themeId);

    setShowThemes(false);

    // Close mobile menu so user immediately sees
    // the selected theme applied to the page.
    setIsOpen(false);
  };

  // ============================================================
  // NAV CLASSES
  // ============================================================

  const desktopClass = ({
    isActive,
  }) =>
    `jt-nav-item relative flex w-14 flex-col items-center justify-center rounded-lg px-1 py-1 text-center transition-all duration-300 ${
      isActive
        ? "jt-nav-active"
        : "jt-nav-normal"
    }`;

  const mobileClass = ({
    isActive,
  }) =>
    `jt-mobile-nav flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
      isActive
        ? "jt-mobile-nav-active"
        : "jt-mobile-nav-normal"
    }`;

  return (
    <nav
      className="jt-main-navbar sticky top-0 z-[999999] overflow-visible border-b shadow-md"
      style={{
        backgroundColor:
          theme?.surface || "#141412",

        color:
          theme?.text || "#f3f4f6",

        borderColor:
          theme?.border || "#2e303a",
      }}
    >
      {/* ======================================================
          NAVBAR-SPECIFIC STYLES
          ====================================================== */}

      <style>{`
        @keyframes logoBounceGlow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-5px) scale(1.05);
            filter:
              drop-shadow(
                0 0 18px
                rgba(var(--jt-accent-rgb), .75)
              );
          }
        }

        .logo-fx {
          animation:
            logoBounceGlow
            .9s ease-in-out
            infinite;
        }

        .logo-fx:hover {
          animation-play-state: paused;
        }

        @keyframes accountPulse {
          0%, 100% {
            box-shadow:
              0 0 0
              rgba(var(--jt-accent-rgb), 0);
          }

          50% {
            box-shadow:
              0 0 14px
              rgba(var(--jt-accent-rgb), .28);
          }
        }

        .account-pulse {
          animation:
            accountPulse
            1.8s
            ease-in-out
            infinite;
        }

        .account-pulse:hover {
          animation-play-state: paused;
        }

        /*
          These styles deliberately use the
          ThemeContext CSS variables rather than
          Tailwind's hard-coded black/neutral colours.
        */

        .jt-main-navbar {
          background:
            var(--jt-surface, #141412) !important;

          color:
            var(--text, #f3f4f6) !important;

          border-color:
            var(--border, #2e303a) !important;

          transition:
            background-color .3s ease,
            color .3s ease,
            border-color .3s ease;
        }

        .jt-nav-normal {
          color:
            var(--text, #f3f4f6);
        }

        .jt-nav-normal:hover {
          color:
            var(--jt-accent);
          background:
            rgba(
              var(--jt-accent-rgb),
              .08
            );
        }

        .jt-mobile-nav-normal {
          color:
            var(--text, #f3f4f6);

          border-color:
            transparent;
        }

        .jt-mobile-nav-normal:hover {
          background:
            rgba(
              var(--jt-accent-rgb),
              .08
            );
        }

        .jt-theme-surface {
          background:
            var(
              --jt-surface,
              #141412
            ) !important;

          color:
            var(
              --text,
              #f3f4f6
            ) !important;

          border-color:
            var(
              --border,
              #2e303a
            ) !important;
        }

        .jt-theme-surface-light {
          background:
            var(
              --jt-surface-light,
              #1b1b17
            ) !important;

          color:
            var(
              --text,
              #f3f4f6
            ) !important;
        }

        .jt-theme-heading {
          color:
            var(
              --text-h,
              #ffffff
            ) !important;
        }

        /*
          Mobile-specific fix.
          The previous Navbar was permanently using
          bg-neutral-950/bg-black on mobile.
        */

        @media (max-width: 767px) {
          .jt-main-navbar {
            background:
              var(
                --jt-surface,
                #141412
              ) !important;

            color:
              var(
                --text,
                #f3f4f6
              ) !important;
          }

          .jt-mobile-panel {
            background:
              var(
                --jt-surface,
                #141412
              ) !important;

            color:
              var(
                --text,
                #f3f4f6
              ) !important;

            border-color:
              var(
                --border,
                #2e303a
              ) !important;
          }

          .jt-mobile-panel-header {
            background:
              var(
                --jt-surface-light,
                #1b1b17
              ) !important;

            color:
              var(
                --text-h,
                #ffffff
              ) !important;

            border-color:
              var(
                --border,
                #2e303a
              ) !important;
          }

          .jt-mobile-theme-card {
            background:
              var(
                --jt-surface-light,
                #1b1b17
              ) !important;

            color:
              var(
                --text,
                #f3f4f6
              ) !important;

            border-color:
              var(
                --border,
                #2e303a
              ) !important;
          }

          .jt-mobile-theme-card-active {
            border-color:
              var(
                --jt-accent
              ) !important;

            background:
              rgba(
                var(--jt-accent-rgb),
                .12
              ) !important;
          }

          .jt-mobile-account {
            background:
              var(
                --jt-surface-light,
                #1b1b17
              ) !important;

            color:
              var(
                --text,
                #f3f4f6
              ) !important;

            border-color:
              var(
                --border,
                #2e303a
              ) !important;
          }
        }
      `}</style>

      {/* ======================================================
          MAIN NAVBAR ROW
          ====================================================== */}

      <div className="relative mx-auto max-w-7xl overflow-visible px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 overflow-visible">

          {/* LOGO */}

          <Link
            to="/"
            className="relative flex shrink-0 items-center"
          >
            <img
              src={jtownLogo}
              alt="J-Town Hoops"
              className="logo-fx mt-2.5 h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg"
            />
          </Link>

          {/* ==================================================
              DESKTOP SEARCH
              ================================================== */}

          <form
            ref={searchRef}
            onSubmit={handleSearch}
            className="relative hidden max-w-md flex-1 sm:block"
          >
            <div className="relative mx-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />

              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(
                    event.target.value
                  );

                  setShowSuggestions(true);
                }}
                onFocus={() =>
                  searchQuery &&
                  setShowSuggestions(true)
                }
                placeholder="Search J-Town Hoops..."
                className="jt-theme-surface-light jt-focus-border w-full rounded-full border py-1.5 pl-10 pr-16 text-sm outline-none"
              />

              <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                <button
                  type="button"
                  className="jt-accent-hover p-1 opacity-60"
                >
                  <Mic className="h-4 w-4" />
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(
                        false
                      );
                    }}
                    className="p-1 opacity-60 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showSuggestions &&
                searchQuery && (
                  <div className="jt-theme-surface absolute left-0 right-0 top-full z-[1000002] mt-2 overflow-hidden rounded-xl border shadow-2xl">
                    {suggestions.length ? (
                      suggestions.map(
                        (
                          result,
                          index
                        ) => (
                          <button
                            key={`${result.url}-${index}`}
                            type="button"
                            onClick={() =>
                              goTo(result)
                            }
                            className="flex w-full items-center justify-between border-b border-[var(--border)] px-4 py-3 text-left transition hover:bg-[rgba(var(--jt-accent-rgb),.08)]"
                          >
                            <span className="text-sm">
                              {
                                result.title
                              }
                            </span>

                            <span className="text-[10px] uppercase opacity-50">
                              {result.category ||
                                "Result"}
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <div className="p-4 text-sm opacity-50">
                        No suggestions
                      </div>
                    )}
                  </div>
                )}
            </div>
          </form>

          {/* ==================================================
              DESKTOP CONTROLS
              ================================================== */}

          <div className="hidden items-center gap-3 md:flex">
            <NavLink
              to="/"
              end
              className={desktopClass}
            >
              <Home className="mb-1 h-4 w-4" />
              <span className="text-[11px]">
                Home
              </span>
            </NavLink>

            <NavLink
              to="/teams"
              className={desktopClass}
            >
              <Users className="mb-1 h-4 w-4" />
              <span className="text-[11px]">
                Teams
              </span>
            </NavLink>

            <NavLink
              to="/players"
              className={desktopClass}
            >
              <User className="mb-1 h-4 w-4" />
              <span className="text-[11px]">
                Players
              </span>
            </NavLink>

            <NavLink
              to="/schedule"
              className={desktopClass}
            >
              <Calendar className="mb-1 h-4 w-4" />
              <span className="text-[11px]">
                Schedule
              </span>
            </NavLink>

            <NavLink
              to="/ai-assistant"
              className={desktopClass}
            >
              <Bot className="mb-1 h-5 w-5 animate-pulse" />
              <span className="text-[11px]">
                AI Assist
              </span>
            </NavLink>

            <div
              className="h-8 w-px"
              style={{
                backgroundColor:
                  theme?.border ||
                  "#2e303a",
              }}
            />

            {/* ================================================
                DESKTOP THEME SELECTOR
                ================================================ */}

            <div
              ref={themeRef}
              className="relative z-[1000001]"
            >
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(
                    false
                  );

                  setShowThemes(
                    (value) => !value
                  );
                }}
                className={`jt-theme-button flex items-center gap-1.5 rounded-full border px-2.5 py-2 transition ${
                  showThemes
                    ? "jt-theme-button-active"
                    : ""
                }`}
                title={`Theme: ${theme.name}`}
              >
                <Palette className="h-5 w-5" />

                <ChevronDown
                  className={`h-3 w-3 transition ${
                    showThemes
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {showThemes && (
                <div className="jt-theme-surface absolute right-0 top-full z-[1000002] mt-3 w-72 overflow-hidden rounded-2xl border shadow-2xl">

                  <div className="jt-theme-surface-light border-b border-[var(--border)] p-4">
                    <div className="flex items-center gap-2">
                      <Palette className="jt-accent-text h-5 w-5" />

                      <div>
                        <p className="jt-theme-heading text-sm font-black">
                          J-Town Themes
                        </p>

                        <p className="text-[10px] opacity-50">
                          Choose your arena
                          style
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    {themes.map(
                      (option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            chooseTheme(
                              option.id
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                            theme.id ===
                            option.id
                              ? "bg-[rgba(var(--jt-accent-rgb),.12)]"
                              : "hover:bg-[rgba(var(--jt-accent-rgb),.08)]"
                          }`}
                        >
                          <span className="text-lg">
                            {option.emoji}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black">
                              {option.name}
                            </p>

                            <div
                              className="mt-1 h-1.5 w-16 rounded-full"
                              style={{
                                backgroundColor:
                                  option.accent,
                              }}
                            />
                          </div>

                          {theme.id ===
                            option.id && (
                            <Check className="jt-accent-text h-4 w-4" />
                          )}
                        </button>
                      )
                    )}
                  </div>

                  <div className="border-t border-[var(--border)] px-4 py-3 text-[10px] opacity-50">
                    Saved automatically
                    for your next visit.
                  </div>
                </div>
              )}
            </div>

            {/* ================================================
                DESKTOP NOTIFICATIONS
                ================================================ */}

            <div
              ref={notificationRef}
              className="relative z-[1000001]"
            >
              <button
                type="button"
                onClick={
                  toggleNotifications
                }
                className={`jt-notification-button relative rounded-full p-2 transition ${
                  showNotifications
                    ? "jt-notification-active"
                    : ""
                }`}
              >
                <Bell
                  className={`h-5 w-5 ${
                    isSignedIn
                      ? ""
                      : "opacity-30"
                  }`}
                />

                {isSignedIn &&
                  unreadCount > 0 && (
                    <span className="jt-accent-bg absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-black">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
              </button>

              {showNotifications &&
                isSignedIn && (
                  <div className="jt-theme-surface absolute right-0 top-full z-[1000002] mt-3 w-96 overflow-hidden rounded-xl border shadow-2xl">

                    <div className="jt-theme-surface-light flex items-center justify-between border-b border-[var(--border)] p-3">
                      <div>
                        <p className="text-sm font-semibold">
                          League Updates
                        </p>

                        <p className="text-[10px] opacity-50">
                          J-Town Hoops
                          Notifications
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {unreadCount >
                          0 && (
                          <button
                            onClick={
                              markAllRead
                            }
                            className="jt-accent-text text-[10px]"
                          >
                            Mark all read
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setShowNotifications(
                              false
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 divide-y divide-[var(--border)] overflow-y-auto">
                      {notificationFeed.length ? (
                        notificationFeed
                          .slice(0, 5)
                          .map((item) => (
                            <button
                              key={
                                item.id
                              }
                              onClick={() => {
                                markAsRead(
                                  item.id
                                );

                                setShowNotifications(
                                  false
                                );

                                navigate(
                                  item.link ||
                                    "/notifications"
                                );
                              }}
                              className={`flex w-full gap-3 p-3.5 text-left transition hover:bg-[rgba(var(--jt-accent-rgb),.08)] ${
                                item.read
                                  ? ""
                                  : "jt-notification-unread"
                              }`}
                            >
                              <div className="jt-theme-surface-light rounded-lg border p-1.5">
                                {item.category ===
                                "games" ? (
                                  <Trophy className="h-4 w-4 text-amber-500" />
                                ) : item.category ===
                                  "schedule" ? (
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Bell className="jt-accent-text h-4 w-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold">
                                  {
                                    item.title
                                  }
                                </p>

                                <p className="mt-1 text-[11px] opacity-60">
                                  {
                                    item.desc
                                  }
                                </p>

                                <p className="mt-1 text-[9px] opacity-40">
                                  {
                                    item.date
                                  }
                                </p>
                              </div>
                            </button>
                          ))
                      ) : (
                        <div className="p-8 text-center text-xs opacity-50">
                          No notifications
                          yet.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowNotifications(
                          false
                        );

                        navigate(
                          "/notifications"
                        );
                      }}
                      className="jt-accent-text w-full border-t border-[var(--border)] p-4 font-semibold transition hover:bg-[rgba(var(--jt-accent-rgb),.08)]"
                    >
                      View All
                      Notifications
                    </button>
                  </div>
                )}
            </div>

            {/* ================================================
                DESKTOP ACCOUNT
                ================================================ */}

            <Link
              to="/account"
              className="account-pulse jt-account-button jt-theme-surface-light flex items-center gap-2 rounded-full border px-2.5 py-1.5 transition"
            >
              {user ? (
                <>
                  <div className="jt-accent-border flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border">
                    {profile.avatar ? (
                      <img
                        src={
                          profile.avatar
                        }
                        alt={
                          displayName
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle className="jt-accent-text h-6 w-6" />
                    )}
                  </div>

                  <div className="max-w-[100px] leading-tight">
                    <p className="truncate text-xs font-black">
                      {
                        displayName.split(
                          " "
                        )[0]
                      }
                    </p>

                    <p className="jt-accent-text flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide">
                      {displayRole ===
                        "Admin" && (
                        <ShieldCheck
                          size={10}
                        />
                      )}

                      {displayRole}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <UserCircle className="h-5 w-5" />

                  <span className="text-sm font-medium">
                    Account
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* ==================================================
              MOBILE TOP CONTROLS
              ================================================== */}

          <div className="flex items-center gap-1 md:hidden">

            {/* MOBILE THEME BUTTON */}

            <button
              type="button"
              onClick={() => {
                setShowNotifications(
                  false
                );

                setIsOpen(false);

                setShowThemes(
                  (value) => !value
                );
              }}
              className={`jt-theme-button rounded-md border p-2 ${
                showThemes
                  ? "jt-theme-button-active"
                  : ""
              }`}
              title={`Theme: ${theme.name}`}
              aria-label="Choose J-Town theme"
            >
              <Palette className="h-5 w-5" />
            </button>

            {/* MOBILE NOTIFICATION */}

            <button
              type="button"
              onClick={
                toggleNotifications
              }
              className="jt-notification-button relative rounded-md p-2"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />

              {isSignedIn &&
                unreadCount > 0 && (
                  <span className="jt-accent-bg absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] text-black">
                    {unreadCount}
                  </span>
                )}
            </button>

            {/* MOBILE ACCOUNT */}

            {user && (
              <Link
                to="/account"
                className="jt-accent-border flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border"
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle className="jt-accent-text h-6 w-6" />
                )}
              </Link>
            )}

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => {
                setShowThemes(false);

                setShowNotifications(
                  false
                );

                setIsOpen(
                  (value) => !value
                );
              }}
              className="rounded-md p-2 transition"
              aria-label="Open navigation"
            >
              {isOpen ? (
                <X />
              ) : (
                <Menu />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          MOBILE THEME PANEL
          ====================================================== */}

      {showThemes && (
        <div
          ref={themeRef}
          className="jt-mobile-panel absolute left-3 right-3 top-16 z-[1000003] overflow-hidden rounded-2xl border shadow-2xl md:hidden"
        >
          <div className="jt-mobile-panel-header flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <Palette className="jt-accent-text h-4 w-4" />

              <div>
                <b className="text-sm">
                  J-Town Themes
                </b>

                <p className="text-[9px] opacity-50">
                  Choose your arena
                  style
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowThemes(false)
              }
              className="rounded-md p-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            {themes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  chooseTheme(option.id)
                }
                className={`jt-mobile-theme-card rounded-xl border p-3 text-left transition ${
                  theme.id === option.id
                    ? "jt-mobile-theme-card-active"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">
                    {option.emoji}
                  </span>

                  {theme.id ===
                    option.id && (
                    <Check className="jt-accent-text h-4 w-4" />
                  )}
                </div>

                <p className="mt-2 text-[10px] font-black">
                  {option.name}
                </p>

                <div
                  className="mt-2 h-1.5 w-full rounded-full"
                  style={{
                    backgroundColor:
                      option.accent,
                  }}
                />
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--border)] px-3 py-2 text-center text-[9px] opacity-50">
            Theme changes apply to
            desktop and mobile.
          </div>
        </div>
      )}

      {/* ======================================================
          MOBILE NOTIFICATIONS
          ====================================================== */}

      {showNotifications &&
        isSignedIn && (
          <div className="jt-mobile-panel absolute left-3 right-3 top-16 z-[1000002] overflow-hidden rounded-xl border shadow-2xl md:hidden">

            <div className="jt-mobile-panel-header flex justify-between border-b p-3">
              <b>Notifications</b>

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    false
                  )
                }
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 divide-y divide-[var(--border)] overflow-y-auto">
              {notificationFeed.length ? (
                notificationFeed
                  .slice(0, 5)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markAsRead(
                          item.id
                        );

                        setShowNotifications(
                          false
                        );

                        navigate(
                          item.link ||
                            "/notifications"
                        );
                      }}
                      className="w-full p-4 text-left transition hover:bg-[rgba(var(--jt-accent-rgb),.08)]"
                    >
                      <p className="text-sm font-semibold">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs opacity-50">
                        {item.desc}
                      </p>
                    </button>
                  ))
              ) : (
                <div className="p-8 text-center text-xs opacity-50">
                  No notifications
                  yet.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNotifications(
                  false
                );

                navigate(
                  "/notifications"
                );
              }}
              className="jt-accent-text w-full border-t border-[var(--border)] p-4 font-semibold"
            >
              View All Notifications
            </button>
          </div>
        )}

      {/* ======================================================
          MOBILE NAVIGATION
          ====================================================== */}

      {isOpen && (
        <div className="jt-mobile-panel absolute left-0 right-0 top-16 z-[999998] border-t shadow-2xl md:hidden">
          <div className="space-y-2 px-4 py-5">

            <NavLink
              to="/"
              end
              className={mobileClass}
            >
              <Home className="h-4 w-4" />
              Home
            </NavLink>

            <NavLink
              to="/teams"
              className={mobileClass}
            >
              <Users className="h-4 w-4" />
              Teams
            </NavLink>

            <NavLink
              to="/players"
              className={mobileClass}
            >
              <User className="h-4 w-4" />
              Players
            </NavLink>

            <NavLink
              to="/schedule"
              className={mobileClass}
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </NavLink>

            <NavLink
              to="/ai-assistant"
              className={mobileClass}
            >
              <Bot className="h-5 w-5" />
              AI Assistant
            </NavLink>

            <NavLink
              to="/notifications"
              className={mobileClass}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </NavLink>

            {/* MOBILE ACCOUNT */}

            <Link
              to="/account"
              onClick={() =>
                setIsOpen(false)
              }
              className="jt-mobile-account mt-3 flex items-center gap-3 rounded-xl border p-3"
            >
              <div className="jt-accent-border flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
                {user &&
                profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle className="jt-accent-text h-6 w-6" />
                )}
              </div>

              <div>
                <p className="font-black">
                  {user
                    ? displayName
                    : "Sign In / Register"}
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