/**
 * Theme Storage
 * Handles storage of theme settings using Tauri Store
 */

import { getStore } from './storeManager';

export type ThemeMode = 'system' | 'light' | 'dark';

interface StoredThemeData {
  theme: ThemeMode;
}

const STORE_FILE = 'settings.json';
const THEME_KEY = 'theme';

/**
 * Validate if a value is a valid ThemeMode
 */
function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

/**
 * Save theme setting to Tauri Store
 */
export async function saveTheme(theme: ThemeMode): Promise<void> {
  // Runtime validation
  if (!isValidThemeMode(theme)) {
    throw new Error(`Invalid theme mode: ${String(theme)}`);
  }

  try {
    const s = await getStore(STORE_FILE);
    const data: StoredThemeData = { theme };
    await s.set(THEME_KEY, data);
    await s.save();
  } catch (error) {
    console.error('Failed to save theme:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save theme: ${errorMessage}`);
  }
}

/**
 * Load theme setting from Tauri Store
 */
export async function loadTheme(): Promise<ThemeMode | null> {
  try {
    const s = await getStore(STORE_FILE);
    const data = await s.get<StoredThemeData>(THEME_KEY);

    // Validate loaded data
    if (data?.theme && isValidThemeMode(data.theme)) {
      return data.theme;
    } else {
      if (data?.theme) {
        console.warn('Invalid theme mode in storage:', data.theme);
      }
      return null;
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
    return null;
  }
}

/**
 * Clear theme setting from Tauri Store
 */
export async function clearTheme(): Promise<void> {
  try {
    const s = await getStore(STORE_FILE);
    await s.delete(THEME_KEY);
    await s.save();
  } catch (error) {
    console.error('Failed to clear theme:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clear theme: ${errorMessage}`);
  }
}

/**
 * Check if theme setting exists
 */
export async function hasTheme(): Promise<boolean> {
  try {
    const s = await getStore(STORE_FILE);
    return await s.has(THEME_KEY);
  } catch (error) {
    console.error('Failed to check theme:', error);
    return false;
  }
}
