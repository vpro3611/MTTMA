import { reactive } from "vue";

type Theme = "dark" | "black";

const STORAGE_KEY = "app-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export const themeStore = reactive({
  current: "dark" as Theme,

  init() {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored === "black" ? "black" : "dark";
    this.current = initial;
    applyTheme(initial);
  },

  setTheme(theme: Theme) {
    this.current = theme;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
    applyTheme(theme);
  },

  toggle() {
    this.setTheme(this.current === "dark" ? "black" : "dark");
  },
});

