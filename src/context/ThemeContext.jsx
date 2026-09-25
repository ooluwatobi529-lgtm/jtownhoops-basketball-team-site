import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext = createContext(null);

// ============================================================
// J-TOWN HOOPS THEMES
// Works on desktop, tablet, mobile and Vercel.
// ============================================================

export const JTOWN_THEMES = {
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

const STORAGE_KEY = "jtown_hoops_theme";

// ============================================================
// SAFELY READ SAVED THEME
// ============================================================

function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && JTOWN_THEMES[saved]) {
      return saved;
    }
  } catch {
    // localStorage may occasionally be unavailable.
  }

  return "classic";
}

// ============================================================
// THEME PROVIDER
// ============================================================

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(getSavedTheme);

  const theme =
    JTOWN_THEMES[themeId] ||
    JTOWN_THEMES.classic;

  // ==========================================================
  // APPLY THEME TO THE ENTIRE DOCUMENT
  // ==========================================================

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.dataset.jtownTheme = theme.id;

    // Accent colours
    root.style.setProperty(
      "--jt-accent",
      theme.accent
    );

    root.style.setProperty(
      "--jt-accent-bright",
      theme.accentBright
    );

    root.style.setProperty(
      "--jt-accent-dark",
      theme.accentDark
    );

    root.style.setProperty(
      "--jt-accent-rgb",
      theme.rgb
    );

    // Existing variables used throughout J-Town
    root.style.setProperty(
      "--accent",
      theme.accent
    );

    root.style.setProperty(
      "--accent-bg",
      `rgba(${theme.rgb}, 0.10)`
    );

    root.style.setProperty(
      "--accent-border",
      `rgba(${theme.rgb}, 0.50)`
    );

    root.style.setProperty(
      "--jt-glow",
      `rgba(${theme.rgb}, 0.35)`
    );

    root.style.setProperty(
      "--jt-glow-soft",
      `rgba(${theme.rgb}, 0.12)`
    );

    // Page colours
    root.style.setProperty(
      "--bg",
      theme.background
    );

    root.style.setProperty(
      "--jt-bg",
      theme.background
    );

    root.style.setProperty(
      "--jt-black",
      theme.background
    );

    root.style.setProperty(
      "--jt-surface",
      theme.surface
    );

    root.style.setProperty(
      "--jt-surface-light",
      theme.surfaceLight
    );

    root.style.setProperty(
      "--text",
      theme.text
    );

    root.style.setProperty(
      "--text-h",
      theme.textHeading
    );

    root.style.setProperty(
      "--border",
      theme.border
    );

    // Browser controls/forms should follow the theme.
    root.style.colorScheme =
      theme.colorScheme;

    // Apply directly to HTML and BODY as well.
    root.style.backgroundColor =
      theme.background;

    root.style.color =
      theme.text;

    body.style.backgroundColor =
      theme.background;

    body.style.color =
      theme.text;

    body.dataset.jtownTheme = theme.id;

    // Save the theme so refresh keeps it.
    try {
      localStorage.setItem(
        STORAGE_KEY,
        theme.id
      );
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  // ==========================================================
  // CHANGE THEME
  // ==========================================================

  const setTheme = (nextTheme) => {
    if (JTOWN_THEMES[nextTheme]) {
      setThemeId(nextTheme);
    }
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      theme,
      themeId,

      themes: Object.values(
        JTOWN_THEMES
      ),

      setTheme,
    }),
    [theme, themeId]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// USE THEME HOOK
// ============================================================

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

export default ThemeContext;