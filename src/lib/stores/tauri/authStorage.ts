/**
 * Authentication Storage
 * Handles secure storage of authentication tokens using Tauri Store
 */

import { getStore } from './storeManager';

interface StoredAuthData {
  userId: string;
  accessToken: string;
  deviceId: string;
  homeServer: string;
  baseUrl: string;
}

const STORE_FILE = 'auth.json';
const AUTH_KEY = 'credentials';

/**
 * Save authentication data to Tauri Store
 */
export async function saveAuthData(data: StoredAuthData): Promise<void> {
  try {
    const s = await getStore(STORE_FILE);
    await s.set(AUTH_KEY, data);
    await s.save();
  } catch (error) {
    console.error('[authStorage] Failed to save auth data');
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save authentication data: ${errorMessage}`);
  }
}

/**
 * Load authentication data from Tauri Store
 */
export async function loadAuthData(): Promise<StoredAuthData | null> {
  try {
    const s = await getStore(STORE_FILE);
    const data = await s.get<StoredAuthData>(AUTH_KEY);
    return data || null;
  } catch {
    console.error('[authStorage] Failed to load auth data');
    return null;
  }
}

/**
 * Clear authentication data from Tauri Store
 */
export async function clearAuthData(): Promise<void> {
  try {
    const s = await getStore(STORE_FILE);
    await s.delete(AUTH_KEY);
    await s.save();
  } catch (error) {
    console.error('[authStorage] Failed to clear auth data');
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to clear authentication data: ${errorMessage}`);
  }
}

/**
 * Check if authentication data exists
 */
export async function hasAuthData(): Promise<boolean> {
  try {
    const s = await getStore(STORE_FILE);
    return await s.has(AUTH_KEY);
  } catch {
    console.error('[authStorage] Failed to check auth data');
    return false;
  }
}
