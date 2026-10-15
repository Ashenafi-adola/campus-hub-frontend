"use client";
import React, { createContext, useEffect, useSyncExternalStore } from "react";

export type Theme = 'light' | 'dark'
type ThemeContextValue = [isDark: boolean, toggleTheme: () => void]

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const themeListeners = new Set<() => void>()

function getThemeSnapshot(): Theme {
  return typeof window !== 'undefined' && window.localStorage.getItem('theme') === 'dark'
    ? 'dark'
    : 'light'
}

function getServerThemeSnapshot(): Theme {
  return 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'theme' || event.key === null) listener()
  }
  window.addEventListener('storage', handleStorage)

  return () => {
    themeListeners.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

export function ThemeProvider({ children }:{ children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const nextTheme = getThemeSnapshot() === 'dark' ? 'light' : 'dark'
    window.localStorage.setItem('theme', nextTheme)
    applyTheme(nextTheme)
    themeListeners.forEach((listener) => listener())
  }

  return (
    <ThemeContext.Provider value={[theme === 'dark', toggleTheme]}>
      {children}
    </ThemeContext.Provider>
  )
}