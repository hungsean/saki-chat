import { vi } from 'vitest';

/**
 * Tauri Store Mock
 * 用於測試中模擬 Tauri Store API
 */

type StoreData = Record<string, unknown>;

class MockStore {
  private data: StoreData = {};

  async get<T>(key: string): Promise<T | null> {
    return (this.data[key] as T) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.data[key] = value;
  }

  async delete(key: string): Promise<boolean> {
    if (key in this.data) {
      delete this.data[key];
      return true;
    }
    return false;
  }

  async clear(): Promise<void> {
    this.data = {};
  }

  async keys(): Promise<string[]> {
    return Object.keys(this.data);
  }

  async has(key: string): Promise<boolean> {
    return key in this.data;
  }

  // 測試用的輔助方法
  __reset(): void {
    this.data = {};
  }

  __getData(): StoreData {
    return { ...this.data };
  }
}

// 建立單例
const mockStoreInstance = new MockStore();

/**
 * 模擬 @tauri-apps/plugin-store
 */
export const mockTauriStore = {
  Store: vi.fn(() => mockStoreInstance),
  load: vi.fn(async () => mockStoreInstance),
};

/**
 * 重置 Mock Store 狀態
 * 建議在每個測試的 beforeEach 中呼叫
 */
export function resetMockTauriStore(): void {
  mockStoreInstance.__reset();
}

/**
 * 取得 Mock Store 實例
 * 用於測試中檢查狀態
 */
export function getMockTauriStore(): MockStore {
  return mockStoreInstance;
}

/**
 * 模擬 Tauri API 的通用方法
 */
export const mockTauriInvoke = vi.fn(
  async (command: string, args?: unknown) => {
    // 可以根據 command 返回不同的模擬資料
    console.log(`Mock Tauri invoke: ${command}`, args);
    return null;
  }
);
