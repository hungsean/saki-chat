/**
 * Theme Provider
 * Handles theme initialization, system theme detection, and applies CSS classes
 */

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/stores/zustand/themeStore';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const {
    mode,
    resolvedTheme,
    isInitialized,
    initializeTheme,
    setResolvedTheme,
  } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeTheme();
    }
  }, [isInitialized, initializeTheme]);

  // Listen for system theme changes when mode is 'system'
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newTheme = mediaQuery.matches ? 'dark' : 'light';
      if (import.meta.env.DEV) {
        console.log('[ThemeProvider] System theme changed:', newTheme);
      }
      setResolvedTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, setResolvedTheme]);

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(resolvedTheme);

    if (import.meta.env.DEV) {
      console.log('[ThemeProvider] Theme applied:', resolvedTheme);
    }
  }, [resolvedTheme]);

  return <>{children}</>;
}
