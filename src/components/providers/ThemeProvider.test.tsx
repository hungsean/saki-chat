import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import type { ThemeMode, ResolvedTheme } from '@/lib/stores/zustand/themeStore';

// Create mock functions outside of vi.mock
const mockInitializeTheme = vi.fn();
const mockSetResolvedTheme = vi.fn();
const mockSetTheme = vi.fn();

// Create mock store object outside of vi.mock
interface MockThemeStore {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isInitialized: boolean;
  setTheme: typeof mockSetTheme;
  setResolvedTheme: typeof mockSetResolvedTheme;
  initializeTheme: typeof mockInitializeTheme;
}

const mockThemeStore: MockThemeStore = {
  mode: 'system',
  resolvedTheme: 'light',
  isInitialized: false,
  setTheme: mockSetTheme,
  setResolvedTheme: mockSetResolvedTheme,
  initializeTheme: mockInitializeTheme,
};

// Mock the module
vi.mock('@/lib/stores/zustand/themeStore', () => {
  return {
    useThemeStore: Object.assign(
      (selector?: (state: MockThemeStore) => unknown) => {
        if (selector) {
          return selector(mockThemeStore);
        }
        return mockThemeStore;
      },
      {
        getState: () => mockThemeStore,
      }
    ),
  };
});

describe('ThemeProvider', () => {
  let mediaQueryListeners: ((e: unknown) => void)[] = [];
  let mockMediaQuery: { matches: boolean };

  beforeEach(() => {
    vi.clearAllMocks();
    mediaQueryListeners = [];

    // Reset mock store state
    mockThemeStore.mode = 'system';
    mockThemeStore.resolvedTheme = 'light';
    mockThemeStore.isInitialized = false;
    mockInitializeTheme.mockResolvedValue(undefined);

    // Create a mutable mediaQuery object
    mockMediaQuery = { matches: false };

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        get matches() {
          return mockMediaQuery.matches;
        },
        media: query,
        onchange: null,
        addEventListener: vi.fn(
          (event: string, listener: (e: unknown) => void) => {
            if (event === 'change') {
              mediaQueryListeners.push(listener);
            }
          }
        ),
        removeEventListener: vi.fn(
          (event: string, listener: (e: unknown) => void) => {
            if (event === 'change') {
              mediaQueryListeners = mediaQueryListeners.filter(
                (l) => l !== listener
              );
            }
          }
        ),
        dispatchEvent: vi.fn(),
      })),
    });

    // Reset document classes
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    mediaQueryListeners = [];
  });

  describe('基本渲染', () => {
    it('應該成功渲染子元件', () => {
      const { container } = render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(container.textContent).toBe('Test Content');
    });
  });

  describe('主題初始化', () => {
    it('應該在未初始化時呼叫 initializeTheme', async () => {
      mockThemeStore.isInitialized = false;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockInitializeTheme).toHaveBeenCalled();
      });
    });

    it('應該在已初始化時不呼叫 initializeTheme', () => {
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      expect(mockInitializeTheme).not.toHaveBeenCalled();
    });
  });

  describe('CSS 類別套用', () => {
    it('應該在 light 主題時套用 light 類別', async () => {
      mockThemeStore.resolvedTheme = 'light';
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });

    it('應該在 dark 主題時套用 dark 類別', async () => {
      mockThemeStore.resolvedTheme = 'dark';
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.classList.contains('light')).toBe(
          false
        );
      });
    });

    it('應該在主題變更時更新 CSS 類別', async () => {
      mockThemeStore.resolvedTheme = 'light';
      mockThemeStore.isInitialized = true;

      const { rerender } = render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });

      // Change theme to dark
      mockThemeStore.resolvedTheme = 'dark';
      rerender(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.classList.contains('light')).toBe(
          false
        );
      });
    });
  });

  describe('系統主題偵測', () => {
    it('應該在 system 模式時監聽系統主題變化', () => {
      mockThemeStore.mode = 'system';
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)'
      );
    });

    it('應該在非 system 模式時不監聽系統主題變化', () => {
      mockThemeStore.mode = 'light';
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      // matchMedia might still be called, but listeners should not be active
      // We verify this by checking that mediaQueryListeners is empty or listeners don't affect state
      expect(mediaQueryListeners.length).toBe(0);
    });

    it('應該在系統主題變為 dark 時更新 resolvedTheme', async () => {
      mockThemeStore.mode = 'system';
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mediaQueryListeners.length).toBeGreaterThan(0);
      });

      // Simulate system theme change to dark
      mockMediaQuery.matches = true;
      const mockEvent = {};
      mediaQueryListeners.forEach((listener) => listener(mockEvent));

      expect(mockSetResolvedTheme).toHaveBeenCalledWith('dark');
    });

    it('應該在系統主題變為 light 時更新 resolvedTheme', async () => {
      mockThemeStore.mode = 'system';
      mockThemeStore.isInitialized = true;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mediaQueryListeners.length).toBeGreaterThan(0);
      });

      // Simulate system theme change to light
      mockMediaQuery.matches = false;
      const mockEvent = {};
      mediaQueryListeners.forEach((listener) => listener(mockEvent));

      expect(mockSetResolvedTheme).toHaveBeenCalledWith('light');
    });

    it('應該在元件卸載時移除事件監聽器', async () => {
      mockThemeStore.mode = 'system';
      mockThemeStore.isInitialized = true;

      const { unmount } = render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mediaQueryListeners.length).toBeGreaterThan(0);
      });

      const listenerCountBefore = mediaQueryListeners.length;
      expect(listenerCountBefore).toBeGreaterThan(0);

      unmount();

      // After unmount, listeners should be removed
      await waitFor(() => {
        expect(mediaQueryListeners.length).toBe(0);
      });
    });
  });

  describe('整合測試', () => {
    it('應該正確處理完整的主題初始化和套用流程', async () => {
      mockThemeStore.mode = 'system';
      mockThemeStore.resolvedTheme = 'light';
      mockThemeStore.isInitialized = false;

      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      // Should initialize theme
      await waitFor(() => {
        expect(mockInitializeTheme).toHaveBeenCalled();
      });

      // Should apply light theme class
      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true);
      });
    });

    it('應該在模式從 light 切換到 system 時開始監聽系統主題', async () => {
      mockThemeStore.mode = 'light';
      mockThemeStore.isInitialized = true;

      const { rerender } = render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      expect(mediaQueryListeners.length).toBe(0);

      // Switch to system mode
      mockThemeStore.mode = 'system';
      rerender(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mediaQueryListeners.length).toBeGreaterThan(0);
      });
    });
  });
});
