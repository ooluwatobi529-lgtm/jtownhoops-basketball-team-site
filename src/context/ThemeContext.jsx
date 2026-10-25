
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { API_URL } from "../services/api";

// ============================================================
// J-TOWN HOOPS GLOBAL THEME SYSTEM
// ============================================================

const ThemeContext = createContext(null);

const STORAGE_KEY = "jtown_hoops_theme";
const ACCOUNT_STORAGE_PREFIX = "jtown_hoops_theme_account_";

const THEMES = {
  classic: {
    id: "classic",
    name: "J-Town Classic",
    emoji: "🏀",
    accent: "#f97316",
    accentBright: "#fb923c",
    accentDark: "#c2410c",
    rgb: "249, 115, 22",
    background: "#0d0d0c",
    surface: "#141412",
    surfaceLight: "#1b1b17",
    text: "#f3f4f6",
    textHeading: "#ffffff",
    border: "#2e303a",
    colorScheme: "dark",
  },
  gold: {
    id: "gold",
    name: "Championship Gold",
    emoji: "🏆",
    accent: "#f59e0b",
    accentBright: "#fbbf24",
    accentDark: "#b45309",
    rgb: "245, 158, 11",
    background: "#0d0d0c",
    surface: "#17140d",
    surfaceLight: "#211b0e",
    text: "#f8f5eb",
    textHeading: "#ffffff",
    border: "#3a321d",
    colorScheme: "dark",
  },
  electric: {
    id: "electric",
    name: "Electric Court",
    emoji: "⚡",
    accent: "#38bdf8",
    accentBright: "#7dd3fc",
    accentDark: "#0369a1",
    rgb: "56, 189, 248",
    background: "#071017",
    surface: "#0d1820",
    surfaceLight: "#13242e",
    text: "#e8f7ff",
    textHeading: "#ffffff",
    border: "#23404f",
    colorScheme: "dark",
  },
  gameNight: {
    id: "gameNight",
    name: "Game Night",
    emoji: "🔴",
    accent: "#ef4444",
    accentBright: "#f87171",
    accentDark: "#b91c1c",
    rgb: "239, 68, 68",
    background: "#100909",
    surface: "#190e0e",
    surfaceLight: "#251313",
    text: "#fff1f1",
    textHeading: "#ffffff",
    border: "#452020",
    colorScheme: "dark",
  },
  neon: {
    id: "neon",
    name: "Neon Arena",
    emoji: "🟣",
    accent: "#a855f7",
    accentBright: "#c084fc",
    accentDark: "#7e22ce",
    rgb: "168, 85, 247",
    background: "#0d0712",
    surface: "#160c1e",
    surfaceLight: "#21112d",
    text: "#f7edff",
    textHeading: "#ffffff",
    border: "#3a2050",
    colorScheme: "dark",
  },
  street: {
    id: "street",
    name: "Street Court",
    emoji: "🟢",
    accent: "#22c55e",
    accentBright: "#4ade80",
    accentDark: "#15803d",
    rgb: "34, 197, 94",
    background: "#07100a",
    surface: "#0d1810",
    surfaceLight: "#13251a",
    text: "#edfff2",
    textHeading: "#ffffff",
    border: "#20452c",
    colorScheme: "dark",
  },
  light: {
    id: "light",
    name: "Day Court",
    emoji: "☀️",
    accent: "#ea580c",
    accentBright: "#f97316",
    accentDark: "#c2410c",
    rgb: "234, 88, 12",
    background: "#f5f5f4",
    surface: "#ffffff",
    surfaceLight: "#eeeeec",
    text: "#292524",
    textHeading: "#0c0a09",
    border: "#d6d3d1",
    colorScheme: "light",
  },
};

// ============================================================
// THEME VALIDATION AND STORAGE
// ============================================================

function isValidTheme(id) {
  return (
    typeof id === "string" &&
    Object.prototype.hasOwnProperty.call(THEMES, id)
  );
}

function readStorage(key) {
  try {
    const value = localStorage.getItem(key);
    return isValidTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Continue without browser storage.
  }
}

function accountStorageKey(userId) {
  return `${ACCOUNT_STORAGE_PREFIX}${encodeURIComponent(userId)}`;
}

function getAccountTheme(userId) {
  if (!userId) return null;
  return readStorage(accountStorageKey(userId));
}

function getGuestTheme() {
  return readStorage(STORAGE_KEY) || "classic";
}

// ============================================================
// APPLY THEME TO THE WHOLE WEBSITE
// ============================================================

function applyTheme(id) {
  const theme = THEMES[id];

  if (!theme || typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  const variables = {
    "--jt-accent": theme.accent,
    "--jt-accent-bright": theme.accentBright,
    "--jt-accent-dark": theme.accentDark,
    "--jt-accent-rgb": theme.rgb,

    "--jt-orange": theme.accent,
    "--jt-orange-bright": theme.accentBright,
    "--jt-orange-hot": theme.accent,
    "--jt-orange-dark": theme.accentDark,

    "--accent": theme.accent,
    "--accent-bg": `rgba(${theme.rgb}, 0.10)`,
    "--accent-border": `rgba(${theme.rgb}, 0.50)`,

    "--jt-glow": `rgba(${theme.rgb}, 0.35)`,
    "--jt-glow-soft": `rgba(${theme.rgb}, 0.12)`,

    "--bg": theme.background,
    "--jt-bg": theme.background,
    "--jt-black": theme.background,

    "--jt-surface": theme.surface,
    "--jt-surface-light": theme.surfaceLight,

    "--text": theme.text,
    "--text-h": theme.textHeading,
    "--jt-text": theme.text,
    "--jt-text-heading": theme.textHeading,

    "--border": theme.border,
    "--jt-border": theme.border,
  };

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.dataset.jtownTheme = id;
  body.dataset.jtownTheme = id;

  root.style.colorScheme = theme.colorScheme;
  root.style.backgroundColor = theme.background;
  body.style.backgroundColor = theme.background;

  root.style.color = theme.text;
  body.style.color = theme.text;
}

// ============================================================
// BACKEND CONNECTION
// ============================================================

const PREFERENCES_URL =
  `${String(API_URL).replace(/\/+$/, "")}/api/v1/profile/preferences`;

function getAuthHeaders(json = false) {
  const headers = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const token = localStorage.getItem("jtown-hoops-token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Cookie authentication may be available.
  }

  return headers;
}

// ============================================================
// PROVIDER
// ============================================================

export function ThemeProvider({ children }) {
  const { user, authInitialized } = useAuth();

  const userId = String(
    user?.id || user?._id || user?.email || ""
  );

  const [themeId, setThemeId] = useState(getGuestTheme);
  const [syncStatus, setSyncStatus] = useState("local");

  const currentThemeRef = useRef(themeId);
  const activeUserRef = useRef(null);
  const sessionVersionRef = useRef(0);
  const changeVersionRef = useRef(0);

  const pendingSaveRef = useRef(null);
  const savingRef = useRef(false);

  const theme = THEMES[themeId] || THEMES.classic;

  const themes = useMemo(() => Object.values(THEMES), []);

  // ==========================================================
  // CHANGE THEME IMMEDIATELY
  // ==========================================================

  const commitTheme = useCallback((id) => {
    if (!isValidTheme(id)) return;

    currentThemeRef.current = id;
    setThemeId(id);
    applyTheme(id);
  }, []);

  // ==========================================================
  // SAVE CHANGES SEQUENTIALLY
  // Prevent older requests overwriting newer selections.
  // ==========================================================

  const flushPendingSave = useCallback(async () => {
    if (savingRef.current) return;

    savingRef.current = true;

    try {
      while (pendingSaveRef.current) {
        const task = pendingSaveRef.current;
        pendingSaveRef.current = null;

        if (
          !task.userId ||
          task.sessionVersion !== sessionVersionRef.current ||
          task.userId !== activeUserRef.current
        ) {
          continue;
        }

        setSyncStatus("saving");

        try {
          const response = await fetch(PREFERENCES_URL, {
            method: "PATCH",
            credentials: "include",
            headers: getAuthHeaders(true),
            body: JSON.stringify({
              theme: task.themeId,
            }),
          });

          const result = await response.json();

          if (
            task.sessionVersion !== sessionVersionRef.current ||
            task.userId !== activeUserRef.current
          ) {
            continue;
          }

          if (!response.ok || result?.success === false) {
            if (!pendingSaveRef.current) {
              setSyncStatus("local");
            }
            continue;
          }

          if (!pendingSaveRef.current) {
            setSyncStatus("synced");
          }
        } catch {
          if (
            task.sessionVersion === sessionVersionRef.current &&
            task.userId === activeUserRef.current &&
            !pendingSaveRef.current
          ) {
            setSyncStatus("local");
          }
        }
      }
    } finally {
      savingRef.current = false;
    }
  }, []);

  const queueRemoteSave = useCallback(
    (id, accountId) => {
      if (!accountId) return;

      pendingSaveRef.current = {
        themeId: id,
        userId: accountId,
        sessionVersion: sessionVersionRef.current,
      };

      setSyncStatus("saving");

      void flushPendingSave();
    },
    [flushPendingSave]
  );

  // ==========================================================
  // HANDLE LOGIN, LOGOUT AND ACCOUNT SWITCHING
  // ==========================================================

  useLayoutEffect(() => {
    if (!authInitialized) return;

    if (activeUserRef.current === userId) return;

    sessionVersionRef.current += 1;
    changeVersionRef.current += 1;

    activeUserRef.current = userId;
    pendingSaveRef.current = null;

    if (!userId) {
      commitTheme(getGuestTheme());
      setSyncStatus("local");
      return;
    }

    const cachedTheme =
      getAccountTheme(userId) ||
      (isValidTheme(user?.preferences?.theme)
        ? user.preferences.theme
        : "classic");

    commitTheme(cachedTheme);
    setSyncStatus("loading");
  }, [authInitialized, userId, user, commitTheme]);

  // ==========================================================
  // LOAD THE ACCOUNT'S THEME FROM MONGODB
  // ==========================================================

  useEffect(() => {
    if (!authInitialized || !userId) return;

    const controller = new AbortController();
    const sessionVersion = sessionVersionRef.current;
    const changeVersion = changeVersionRef.current;

    async function loadPreference() {
      try {
        const response = await fetch(PREFERENCES_URL, {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (!controller.signal.aborted) {
            setSyncStatus("local");
          }
          return;
        }

        const data = await response.json();

        const remoteTheme =
          data?.preferences?.theme ||
          data?.user?.preferences?.theme ||
          data?.theme;

        if (
          controller.signal.aborted ||
          sessionVersion !== sessionVersionRef.current ||
          changeVersion !== changeVersionRef.current ||
          userId !== activeUserRef.current
        ) {
          return;
        }

        if (isValidTheme(remoteTheme)) {
          commitTheme(remoteTheme);
          writeStorage(accountStorageKey(userId), remoteTheme);
          setSyncStatus("synced");
        } else {
          setSyncStatus("local");
        }
      } catch {
        if (
          !controller.signal.aborted &&
          sessionVersion === sessionVersionRef.current &&
          userId === activeUserRef.current
        ) {
          setSyncStatus("local");
        }
      }
    }

    void loadPreference();

    return () => controller.abort();
  }, [authInitialized, userId, commitTheme]);

  // ==========================================================
  // CHANGE THEME FROM NAVBAR OR ANY PAGE
  // ==========================================================

  const setTheme = useCallback(
    (id) => {
      if (!isValidTheme(id)) return;

      changeVersionRef.current += 1;

      commitTheme(id);

      if (authInitialized && userId) {
        writeStorage(accountStorageKey(userId), id);
        queueRemoteSave(id, userId);
      } else {
        writeStorage(STORAGE_KEY, id);
        setSyncStatus("local");
      }
    },
    [
      authInitialized,
      userId,
      commitTheme,
      queueRemoteSave,
    ]
  );

  // ==========================================================
  // SYNCHRONIZE TABS IN THE SAME BROWSER
  // ==========================================================

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.storageArea !== localStorage) return;

      const expectedKey =
        authInitialized && userId
          ? accountStorageKey(userId)
          : STORAGE_KEY;

      if (event.key !== expectedKey) return;

      const incomingTheme = readStorage(expectedKey);

      if (
        !incomingTheme ||
        incomingTheme === currentThemeRef.current
      ) {
        return;
      }

      changeVersionRef.current += 1;
      commitTheme(incomingTheme);

      if (authInitialized && userId) {
        queueRemoteSave(incomingTheme, userId);
      } else {
        setSyncStatus("local");
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [
    authInitialized,
    userId,
    commitTheme,
    queueRemoteSave,
  ]);

  // ==========================================================
  // APPLY THEME WHEN PROVIDER MOUNTS
  // ==========================================================

  useLayoutEffect(() => {
    applyTheme(currentThemeRef.current);
  }, []);

  // ==========================================================
  // CONTEXT VALUES
  // ==========================================================

  const value = useMemo(
    () => ({
      theme,
      themeId,
      themes,
      setTheme,
      syncStatus,
      isRemoteSynced: syncStatus === "synced",
    }),
    [
      theme,
      themeId,
      themes,
      setTheme,
      syncStatus,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// KEEP COMPATIBILITY WITH EXISTING NAVBAR IMPORTS
// ============================================================

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}
