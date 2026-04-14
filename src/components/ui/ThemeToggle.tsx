import React from "react";
import { cn } from "../../utils/variants";
import { useTheme } from "../../theme/ThemeContext";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className={cn("btn outline small header-theme-toggle", className)}
      aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
    >
      <span aria-hidden="true" style={{ fontSize: "1.2rem" }}>
        {theme === "light" ? "🌙" : "☀️"}
      </span>
      <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
};
