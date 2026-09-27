import { useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";

const ACCENT_THEMES = [
  "accent-industrial",
  "accent-neon",
  "accent-retro",
  "accent-lab",
  "accent-contrast",
];

const FONT_CLASSES = [
  "font-digital-7seg",
  "font-tech-mono",
  "font-clean-sans"
];

const ThemeApplicator = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings();
  const { baseTheme, accentTheme, meterFont } = settings;

  useEffect(() => {
    const body = document.body;

    // 1. Gérer le thème de base (Light/Dark/System)
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (baseTheme === "dark" || (baseTheme === "system" && isSystemDark)) {
      body.classList.add("dark");
      body.classList.remove("light");
    } else {
      body.classList.add("light");
      body.classList.remove("dark");
    }

    // 2. Gérer le thème d'accentuation
    body.classList.remove(...ACCENT_THEMES);
    const themeToApply = accentTheme || 'industrial';
    body.classList.add(`accent-${themeToApply}`);

    // 3. Gérer la police des compteurs
    body.classList.remove(...FONT_CLASSES);
    if (meterFont) {
      switch (meterFont) {
        case "DIGITAL_7SEG":
          body.classList.add("font-digital-7seg");
          break;
        case "TECH_MONO":
          body.classList.add("font-tech-mono");
          break;
        case "CLEAN_SANS":
          body.classList.add("font-clean-sans");
          break;
      }
    }

    // 4. Écouter les changements du thème système
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (baseTheme === "system") {
        if (e.matches) {
          body.classList.add("dark");
          body.classList.remove("light");
        } else {
          body.classList.add("light");
          body.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [baseTheme, accentTheme, meterFont]);

  return <>{children}</>;
};

export default ThemeApplicator;
