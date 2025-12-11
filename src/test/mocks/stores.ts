import { vi } from 'vitest';
import type { StateCreator } from 'zustand';

/**
 * Zustand Stores Mock
 * 用於測試中模擬 Zustand store
 */

/**
 * 建立測試用的 Zustand store
 *
 * @example
 * ```typescript
 * const useTestStore = createMockStore<StoreState>({
 *   count: 0,
 *   increment: vi.fn(),
 * });
 * ```
 */
export function createMockStore<T extends object>(initialState: T) {
  let state = { ...initialState };
  const listeners = new Set<(state: T) => void>();

  const getState = (): T => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };

  const subscribe = (listener: (state: T) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const reset = (newState?: Partial<T>) => {
    state = { ...initialState, ...newState };
    listeners.forEach((listener) => listener(state));
  };

  const destroy = () => {
    listeners.clear();
  };

  return {
    getState,
    setState,
    subscribe,
    reset,
    destroy,
    __getListeners: () => listeners,
  };
}

/**
 * Mock 認證 Store 的初始狀態
 */
export const mockAuthStoreState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
  clearError: vi.fn(),
};

/**
 * Mock 聊天 Store 的初始狀態
 */
export const mockChatStoreState = {
  currentRoomId: null,
  messages: [],
  rooms: [],
  isLoading: false,
  error: null,
  sendMessage: vi.fn(),
  loadMessages: vi.fn(),
  loadRooms: vi.fn(),
  setCurrentRoom: vi.fn(),
  clearError: vi.fn(),
};

/**
 * Mock UI Store 的初始狀態
 */
export const mockUIStoreState = {
  theme: 'light' as const,
  sidebarOpen: true,
  settingsOpen: false,
  notificationPermission: 'default' as NotificationPermission,
  toggleSidebar: vi.fn(),
  toggleSettings: vi.fn(),
  setTheme: vi.fn(),
  requestNotificationPermission: vi.fn(),
};

/**
 * 建立所有 Mock Stores
 */
export function createMockStores() {
  return {
    authStore: createMockStore(mockAuthStoreState),
    chatStore: createMockStore(mockChatStoreState),
    uiStore: createMockStore(mockUIStoreState),
  };
}

/**
 * 重置所有 Mock Stores
 */
export function resetMockStores(
  stores: ReturnType<typeof createMockStores>
): void {
  stores.authStore.reset();
  stores.chatStore.reset();
  stores.uiStore.reset();

  // 清除所有 mock 函式的呼叫記錄
  Object.values(mockAuthStoreState).forEach((value) => {
    if (vi.isMockFunction(value)) {
      value.mockClear();
    }
  });

  Object.values(mockChatStoreState).forEach((value) => {
    if (vi.isMockFunction(value)) {
      value.mockClear();
    }
  });

  Object.values(mockUIStoreState).forEach((value) => {
    if (vi.isMockFunction(value)) {
      value.mockClear();
    }
  });
}

/**
 * Mock Zustand 的 create 函式
 * 用於在測試中攔截 store 的建立
 */
export function mockZustandCreate<T extends object>(
  initializer: StateCreator<T>
) {
  const store = createMockStore(
    typeof initializer === 'function'
      ? initializer(vi.fn() as never, vi.fn() as never, vi.fn() as never)
      : initializer
  );

  return Object.assign(
    (selector?: (state: T) => unknown) => {
      const state = store.getState();
      return selector ? selector(state) : state;
    },
    {
      getState: store.getState,
      setState: store.setState,
      subscribe: store.subscribe,
      destroy: store.destroy,
    }
  );
}

/**
 * 輔助函式:等待 store 更新
 */
export async function waitForStoreUpdate<T extends object>(
  store: ReturnType<typeof createMockStore<T>>,
  predicate: (state: T) => boolean,
  timeout = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Store update timeout'));
    }, timeout);

    const unsubscribe = store.subscribe((state) => {
      if (predicate(state)) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });

    // 立即檢查當前狀態
    if (predicate(store.getState())) {
      clearTimeout(timeoutId);
      unsubscribe();
      resolve();
    }
  });
}
