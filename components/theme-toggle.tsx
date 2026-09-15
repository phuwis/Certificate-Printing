"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-8 rounded-full bg-muted border border-border animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="สลับโหมดมืด/สว่าง"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full 
        border-2 border-transparent transition-colors duration-300 ease-in-out 
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${isDark ? "bg-slate-800" : "bg-slate-200"}
      `}
    >
      <span className="absolute inset-0 flex items-center justify-between px-1.5 text-xs select-none">
        <Sun
          className={`w-3.5 h-3.5 ${isDark ? "opacity-40 text-amber-400" : "opacity-0"}`}
        />
        <Moon
          className={`w-3.5 h-3.5 ${isDark ? "opacity-0" : "opacity-40 text-slate-600"}`}
        />
      </span>

      <span
        className={`
          pointer-events-none relative inline-block h-7 w-7 transform rounded-full 
          bg-white dark:bg-slate-900 shadow-md ring-0 transition duration-300 ease-in-out
          flex items-center justify-center
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
        )}
      </span>
    </button>
  );
}
