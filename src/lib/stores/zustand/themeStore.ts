/**
 * Theme Store
 * Manages application theme state and system theme detection
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { type ThemeMode, saveTheme, loadTheme } from '../tauri/themeStorage';

export type { ThemeMode };

export type ResolvedTheme = 'light' | 'dark' | 'saki';

export interface ThemeState {
  // Current theme mode setting
  mode: ThemeMode;

  // Resolved theme (what's actually applied)
  // When mode is 'system', this will be either 'light' or 'dark' based on system preference
  resolvedTheme: ResolvedTheme;

  // Whether the theme has been initialized from storage
  isInitialized: boolean;

  // Actions
  setTheme: (mode: ThemeMode) => Promise<void>;
  setResolvedTheme: (theme: ResolvedTheme) => void;
  initializeTheme: () => Promise<void>;
}

/**
 * Detect system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const useThemeStore = create<ThemeState>()(
  immer((set, get) => ({
    // Initial state
    mode: 'system',
    resolvedTheme: getSystemTheme(),
    isInitialized: false,

    // Set theme mode and persist to storage
    setTheme: async (mode: ThemeMode) => {
      try {
        // Save to Tauri Store
        await saveTheme(mode);

        // Update state
        set((state) => {
          state.mode = mode;
          // Update resolved theme based on new mode
          state.resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
        });

        console.log('[themeStore] Theme updated:', { mode });
      } catch (error) {
        console.error('[themeStore] Failed to set theme:', error);
        throw error;
      }
    },

    // Set resolved theme (used when system theme changes)
    setResolvedTheme: (theme: ResolvedTheme) => {
      set((state) => {
        state.resolvedTheme = theme;
      });
    },

    // Initialize theme from storage
    initializeTheme: async () => {
      try {
        console.log('[themeStore] Initializing theme...');

        // Load saved theme from storage
        const savedTheme = await loadTheme();
        const mode = savedTheme || 'system';

        set((state) => {
          state.mode = mode;
          state.resolvedTheme = mode === 'system' ? getSystemTheme() : mode;
          state.isInitialized = true;
        });

        console.log('[themeStore] ✓ Theme initialized:', {
          mode,
          resolvedTheme: get().resolvedTheme,
        });
      } catch (error) {
        console.error('[themeStore] ✗ Failed to initialize theme:', error);
        // Fallback to default
        set((state) => {
          state.mode = 'system';
          state.resolvedTheme = getSystemTheme();
          state.isInitialized = true;
        });
      }
    },
  }))
);
