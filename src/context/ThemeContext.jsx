import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const JTOWN_THEMES = {
  classic: {
    id: "classic",
    name: "J-Town Classic",
    emoji: "🟠",
    accent: "#f97316",
    accentBright: "#fb923c",
    accentDark: "#c2410c",
    rgb: "249, 115, 22",
  },
  gold: {
    id: "gold",
    name: "Championship Gold",
    emoji: "🏆",
    accent: "#f59e0b",
    accentBright: "#fbbf24",
    accentDark: "#b45309",
    rgb: "245, 158, 11",
  },
  electric: {
    id: "electric",
    name: "Electric Court",
    emoji: "⚡",
    accent: "#38bdf8",
    accentBright: "#7dd3fc",
    accentDark: "#0369a1",
    rgb: "56, 189, 248",
  },
  gameNight: {
    id: "gameNight",
    name: "Game Night",
    emoji: "🔴",
    accent: "#ef4444",
    accentBright: "#f87171",
    accentDark: "#b91c1c",
    rgb: "239, 68, 68",
  },
  neon: {
    id: "neon",
    name: "Neon Arena",
    emoji: "🟣",
    accent: "#a855f7",
    accentBright: "#c084fc",
    accentDark: "#7e22ce",
    rgb: "168, 85, 247",
  },
  street: {
    id: "street",
    name: "Street Court",
    emoji: "🟢",
    accent: "#22c55e",
    accentBright: "#4ade80",
    accentDark: "#15803d",
    rgb: "34, 197, 94",
  },
};

const STORAGE_KEY = "jtown_hoops_theme";

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return JTOWN_THEMES[saved] ? saved : "classic";
  });

  const theme = JTOWN_THEMES[themeId] || JTOWN_THEMES.classic;

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.jtownTheme = theme.id;
    root.style.setProperty("--jt-accent", theme.accent);
    root.style.setProperty("--jt-accent-bright", theme.accentBright);
    root.style.setProperty("--jt-accent-dark", theme.accentDark);
    root.style.setProperty("--jt-accent-rgb", theme.rgb);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-bg", `rgba(${theme.rgb}, 0.10)`);
    root.style.setProperty("--accent-border", `rgba(${theme.rgb}, 0.50)`);
    root.style.setProperty("--jt-glow", `rgba(${theme.rgb}, 0.35)`);
    root.style.setProperty("--jt-glow-soft", `rgba(${theme.rgb}, 0.12)`);

    localStorage.setItem(STORAGE_KEY, theme.id);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      themeId,
      themes: Object.values(JTOWN_THEMES),
      setTheme: setThemeId,
    }),
    [theme, themeId]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
