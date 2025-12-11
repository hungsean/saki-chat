import { vi } from 'vitest';

/**
 * IndexedDB Mock
 * 用於測試中模擬 IndexedDB API
 */

class MockIDBDatabase {
  private stores: Map<string, Map<string, unknown>> = new Map();
  public name: string;
  public version: number;

  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;
  }

  createObjectStore(name: string): MockIDBObjectStore {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return new MockIDBObjectStore(this.stores.get(name)!);
  }

  transaction(
    storeNames: string | string[],
    mode: 'readonly' | 'readwrite' = 'readonly'
  ): MockIDBTransaction {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    return new MockIDBTransaction(this.stores, names, mode);
  }

  close(): void {
    // Mock implementation
  }

  __reset(): void {
    this.stores.clear();
  }

  __getStore(name: string): Map<string, unknown> | undefined {
    return this.stores.get(name);
  }
}

class MockIDBObjectStore {
  private data: Map<string, unknown>;

  constructor(data: Map<string, unknown>) {
    this.data = data;
  }

  get(key: string): MockIDBRequest {
    const value = this.data.get(key);
    return MockIDBRequest.resolve(value);
  }

  getAll(): MockIDBRequest {
    const values = Array.from(this.data.values());
    return MockIDBRequest.resolve(values);
  }

  put(value: unknown, key?: string): MockIDBRequest {
    const finalKey =
      key ?? (value as { id?: string })?.id ?? Math.random().toString();
    this.data.set(finalKey, value);
    return MockIDBRequest.resolve(finalKey);
  }

  add(value: unknown, key?: string): MockIDBRequest {
    const finalKey =
      key ?? (value as { id?: string })?.id ?? Math.random().toString();
    if (this.data.has(finalKey)) {
      return MockIDBRequest.reject(new Error('Key already exists'));
    }
    this.data.set(finalKey, value);
    return MockIDBRequest.resolve(finalKey);
  }

  delete(key: string): MockIDBRequest {
    const success = this.data.delete(key);
    return MockIDBRequest.resolve(success);
  }

  clear(): MockIDBRequest {
    this.data.clear();
    return MockIDBRequest.resolve(undefined);
  }
}

class MockIDBTransaction {
  private stores: Map<string, Map<string, unknown>>;
  private storeNames: string[];
  private mode: 'readonly' | 'readwrite';

  constructor(
    stores: Map<string, Map<string, unknown>>,
    storeNames: string[],
    mode: 'readonly' | 'readwrite'
  ) {
    this.stores = stores;
    this.storeNames = storeNames;
    this.mode = mode;
  }

  objectStore(name: string): MockIDBObjectStore {
    if (!this.storeNames.includes(name)) {
      throw new Error(`Store ${name} not in transaction`);
    }
    const store = this.stores.get(name);
    if (!store) {
      const newStore = new Map();
      this.stores.set(name, newStore);
      return new MockIDBObjectStore(newStore);
    }
    return new MockIDBObjectStore(store);
  }
}

class MockIDBRequest {
  public result: unknown;
  public error: Error | null = null;
  public readyState: 'pending' | 'done' = 'done';
  private listeners: Map<string, Set<(event: unknown) => void>> = new Map();

  private constructor(result: unknown, error: Error | null = null) {
    this.result = result;
    this.error = error;
  }

  static resolve(value: unknown): MockIDBRequest {
    return new MockIDBRequest(value);
  }

  static reject(error: Error): MockIDBRequest {
    return new MockIDBRequest(null, error);
  }

  addEventListener(type: string, listener: (event: unknown) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // 立即觸發事件(模擬非同步完成)
    setTimeout(() => {
      if (type === 'success' && !this.error) {
        listener({ target: this });
      } else if (type === 'error' && this.error) {
        listener({ target: this });
      }
    }, 0);
  }
}

// 全域 Mock 實例
const mockDatabases = new Map<string, MockIDBDatabase>();

/**
 * 模擬 indexedDB.open
 */
export const mockIndexedDB = {
  open: vi.fn((name: string, version = 1) => {
    let db = mockDatabases.get(name);
    if (!db || db.version < version) {
      db = new MockIDBDatabase(name, version);
      mockDatabases.set(name, db);
    }

    const request = MockIDBRequest.resolve(db);
    // 模擬 upgradeneeded 事件
    setTimeout(() => {
      const listeners = (
        request as unknown as {
          listeners?: Map<string, Set<(event: unknown) => void>>;
        }
      ).listeners?.get('upgradeneeded');
      if (listeners) {
        listeners.forEach((listener: (event: unknown) => void) => {
          listener({ target: { result: db } });
        });
      }
    }, 0);

    return request;
  }),

  deleteDatabase: vi.fn((name: string) => {
    mockDatabases.delete(name);
    return MockIDBRequest.resolve(undefined);
  }),
};

/**
 * 重置所有 Mock IndexedDB
 */
export function resetMockIndexedDB(): void {
  mockDatabases.clear();
}

/**
 * 取得指定的 Mock Database
 */
export function getMockDatabase(name: string): MockIDBDatabase | undefined {
  return mockDatabases.get(name);
}

/**
 * Mock idb 套件 (如果專案使用 idb 而非原生 IndexedDB)
 */
export const mockIDB = {
  openDB: vi.fn(
    async (
      name: string,
      version?: number,
      config?: {
        upgrade?: (db: MockIDBDatabase) => void;
      }
    ) => {
      const db = new MockIDBDatabase(name, version ?? 1);
      mockDatabases.set(name, db);

      if (config?.upgrade) {
        config.upgrade(db);
      }

      return db;
    }
  ),

  deleteDB: vi.fn(async (name: string) => {
    mockDatabases.delete(name);
  }),
};

/**
 * 在測試環境中設定全域 indexedDB
 */
export function setupMockIndexedDB(): void {
  if (typeof global !== 'undefined') {
    (global as unknown as { indexedDB: typeof mockIndexedDB }).indexedDB =
      mockIndexedDB;
  }
}
