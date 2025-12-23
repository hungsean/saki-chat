/**
 * Tauri Store Manager
 * Centralized management of Tauri Store instances to avoid duplicate loading
 */

import { Store } from '@tauri-apps/plugin-store';

// Store instances cache
const stores = new Map<string, Store>();

/**
 * Get or create a store instance for the given file
 * @param fileName - The store file name (e.g., 'auth.json', 'settings.json')
 * @returns Promise<Store>
 */
export async function getStore(fileName: string): Promise<Store> {
  // Return cached instance if exists
  if (stores.has(fileName)) {
    return stores.get(fileName)!;
  }

  // Load and cache new store instance
  console.log('[storeManager] Loading store file:', fileName);
  const store = await Store.load(fileName);
  stores.set(fileName, store);
  console.log('[storeManager] ✓ Store loaded:', fileName);

  return store;
}

/**
 * Clear a specific store instance from cache
 * Useful for testing or when you need to force reload
 */
export function clearStoreCache(fileName: string): void {
  stores.delete(fileName);
  console.log('[storeManager] Store cache cleared:', fileName);
}

/**
 * Clear all store instances from cache
 */
export function clearAllStoreCaches(): void {
  stores.clear();
  console.log('[storeManager] All store caches cleared');
}
