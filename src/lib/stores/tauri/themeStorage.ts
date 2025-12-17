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
 * Save theme setting to Tauri Store
 */
export async function saveTheme(theme: ThemeMode): Promise<void> {
  try {
    console.log('[themeStorage] Saving theme...', { theme });
    const s = await getStore(STORE_FILE);
    const data: StoredThemeData = { theme };
    await s.set(THEME_KEY, data);
    await s.save();
    console.log('[themeStorage] ✓ Theme saved successfully');
  } catch (error) {
    console.error('[themeStorage] ✗ Failed to save theme:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save theme: ${errorMessage}`);
  }
}

/**
 * Load theme setting from Tauri Store
 */
export async function loadTheme(): Promise<ThemeMode | null> {
  try {
    console.log('[themeStorage] Loading theme...');
    const s = await getStore(STORE_FILE);
    const data = await s.get<StoredThemeData>(THEME_KEY);
    if (data?.theme) {
      console.log('[themeStorage] ✓ Theme loaded successfully', {
        theme: data.theme,
      });
      return data.theme;
    } else {
      console.log('[themeStorage] ⓘ No theme setting found, using default');
      return null;
    }
  } catch (error) {
    console.error('[themeStorage] ✗ Failed to load theme:', error);
    return null;
  }
}

/**
 * Clear theme setting from Tauri Store
 */
export async function clearTheme(): Promise<void> {
  try {
    console.log('[themeStorage] Clearing theme...');
    const s = await getStore(STORE_FILE);
    await s.delete(THEME_KEY);
    await s.save();
    console.log('[themeStorage] ✓ Theme cleared successfully');
  } catch (error) {
    console.error('[themeStorage] ✗ Failed to clear theme:', error);
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
    console.error('[themeStorage] Failed to check theme:', error);
    return false;
  }
}
