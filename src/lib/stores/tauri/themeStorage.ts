/**
 * Theme Storage
 * Handles storage of theme settings using Tauri Store
 */

import { getStore } from './storeManager';
import { storageLogger } from '@/lib/utils/logger';

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
    const s = await getStore(STORE_FILE);
    const data: StoredThemeData = { theme };
    await s.set(THEME_KEY, data);
    await s.save();
    storageLogger.info('Theme saved:', { theme });
  } catch (error) {
    storageLogger.error('Failed to save theme:', error);
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
    if (data?.theme) {
      storageLogger.info('Theme loaded:', { theme: data.theme });
      return data.theme;
    } else {
      storageLogger.info('No theme setting found, using default');
      return null;
    }
  } catch (error) {
    storageLogger.error('Failed to load theme:', error);
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
    storageLogger.info('Theme cleared');
  } catch (error) {
    storageLogger.error('Failed to clear theme:', error);
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
    storageLogger.error('Failed to check theme:', error);
    return false;
  }
}
