import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex items-center gap-2 px-3 h-8 rounded-lg bg-surface/60 border border-border hover:border-primary/40 hover:text-foreground text-muted-foreground transition-colors"
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      <span className="mono text-[10px] uppercase tracking-[0.18em]">
        {mounted ? (isDark ? "Dark" : "Light") : "Theme"}
      </span>
    </button>
  );
}
