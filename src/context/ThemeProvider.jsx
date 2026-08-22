import { useEffect, useMemo, useState } from "react"
import { ThemeContext } from "@/context/theme-context"

const THEME_KEY = "theme"

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY)

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === "dark"

    root.classList.toggle("dark", isDark)
    root.style.colorScheme = theme

    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme() {
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        )
      },
    }),
    [theme]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}