/**
 * Theme Provider
 * Handles theme initialization, system theme detection, and applies CSS classes
 */

import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/lib/stores/zustand/themeStore';
import { shallow } from 'zustand/shallow';
import { themeLogger } from '@/lib/utils/logger';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Use shallow comparison to optimize re-renders
  const { mode, resolvedTheme, isInitialized } = useThemeStore(
    (state) => ({
      mode: state.mode,
      resolvedTheme: state.resolvedTheme,
      isInitialized: state.isInitialized,
    }),
    shallow
  );

  // Separate selectors for actions (they don't change frequently)
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  // Use ref to get stable access to setResolvedTheme
  const setResolvedThemeRef = useRef(
    useThemeStore.getState().setResolvedTheme
  );

  // Update ref when store changes (but don't cause re-render)
  useEffect(() => {
    setResolvedThemeRef.current = useThemeStore.getState().setResolvedTheme;
  });

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
      themeLogger.info('System theme changed:', newTheme);
      setResolvedThemeRef.current(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]); // Now only depends on mode

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(resolvedTheme);

    themeLogger.info('Theme applied:', resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}
