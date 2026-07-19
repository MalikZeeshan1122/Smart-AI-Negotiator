import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "negotiator-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  return {
    theme,
    setTheme: setThemeState,
    toggle: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
  };
}

// Inline script injected in <head> to set theme before first paint (no FOUC).
export const themeBootScript = `
(function(){try{
  var s=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
  var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  var t=(s==='light'||s==='dark')?s:(m?'dark':'light');
  var r=document.documentElement;
  if(t==='dark')r.classList.add('dark');
  r.style.colorScheme=t;
}catch(e){}})();
`;
