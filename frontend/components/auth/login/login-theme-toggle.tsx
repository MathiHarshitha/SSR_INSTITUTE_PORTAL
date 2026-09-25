"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import styles from "./login.module.css";

/** Same light/dark behaviour as the dashboard topbar toggle, in a clay puck. */
export function LoginThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className={styles.themeToggle}>
      <button
        type="button"
        aria-label="Toggle theme"
        className={styles.clayIconBtn}
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-[1.1rem] w-[1.1rem] dark:hidden" />
        <Moon className="hidden h-[1.1rem] w-[1.1rem] dark:block" />
      </button>
    </div>
  );
}
