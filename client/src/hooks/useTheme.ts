import { useState, useEffect } from "react";
export const useTheme = () => {
  const [localTheme, setLocalTheme] = useState<"dark" | "light">("light");
  const handleSetTheme = (theme: "light" | "dark") => {
    setLocalTheme(theme);
    localStorage.setItem("theme", theme);
  };
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      setLocalTheme("dark");
      return;
    }
    setLocalTheme("light");
  }, []);
  return { theme: localTheme, setTheme: handleSetTheme };
};
