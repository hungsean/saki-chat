/**
 * Authentication Storage
 * Handles secure storage of authentication tokens using Tauri Store
 */

import { Store } from '@tauri-apps/plugin-store';

interface StoredAuthData {
  userId: string;
  accessToken: string;
  deviceId: string;
  homeServer: string;
  baseUrl: string;
}

const STORE_FILE = 'auth.json';
const AUTH_KEY = 'credentials';

let store: Store | null = null;

/**
 * Initialize the store
 */
async function getStore(): Promise<Store> {
  if (!store) {
    console.log('[authStorage] Initializing Tauri Store...', {
      file: STORE_FILE,
    });
    store = await Store.load(STORE_FILE);
    console.log('[authStorage] ✓ Tauri Store initialized');
  }
  return store;
}

/**
 * Save authentication data to Tauri Store
 */
export async function saveAuthData(data: StoredAuthData): Promise<void> {
  try {
    console.log('[authStorage] Saving auth data...', { userId: data.userId });
    const s = await getStore();
    await s.set(AUTH_KEY, data);
    await s.save();
    console.log('[authStorage] ✓ Auth data saved successfully');
  } catch (error) {
    console.error('[authStorage] ✗ Failed to save auth data:', error);
    throw new Error('Failed to save authentication data');
  }
}

/**
 * Load authentication data from Tauri Store
 */
export async function loadAuthData(): Promise<StoredAuthData | null> {
  try {
    console.log('[authStorage] Loading auth data...');
    const s = await getStore();
    const data = await s.get<StoredAuthData>(AUTH_KEY);
    if (data) {
      console.log('[authStorage] ✓ Auth data loaded successfully', {
        userId: data.userId,
      });
    } else {
      console.log('[authStorage] ⓘ No auth data found');
    }
    return data || null;
  } catch (error) {
    console.error('[authStorage] ✗ Failed to load auth data:', error);
    return null;
  }
}

/**
 * Clear authentication data from Tauri Store
 */
export async function clearAuthData(): Promise<void> {
  try {
    console.log('[authStorage] Clearing auth data...');
    const s = await getStore();
    await s.delete(AUTH_KEY);
    await s.save();
    console.log('[authStorage] ✓ Auth data cleared successfully');
  } catch (error) {
    console.error('[authStorage] ✗ Failed to clear auth data:', error);
    throw new Error('Failed to clear authentication data');
  }
}

/**
 * Check if authentication data exists
 */
export async function hasAuthData(): Promise<boolean> {
  try {
    const s = await getStore();
    return await s.has(AUTH_KEY);
  } catch (error) {
    console.error('Failed to check auth data:', error);
    return false;
  }
}
