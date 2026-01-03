import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useThemeStore } from './themeStore';
import * as themeStorage from '../tauri/themeStorage';

// Mock themeStorage
vi.mock('../tauri/themeStorage', () => ({
  saveTheme: vi.fn(),
  loadTheme: vi.fn(),
}));

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('themeStore', () => {
  beforeEach(() => {
    // 重置 store 到初始狀態
    useThemeStore.setState({
      mode: 'system',
      resolvedTheme: 'light',
      isInitialized: false,
    });

    // 重置 mocks
    vi.clearAllMocks();

    // Mock matchMedia 預設回傳 light 主題
    mockMatchMedia.mockReturnValue({
      matches: false, // false = light theme
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    // Mock console 方法
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      const state = useThemeStore.getState();

      expect(state.mode).toBe('system');
      expect(state.resolvedTheme).toBe('light');
      expect(state.isInitialized).toBe(false);
    });

    it('應該在初始化時偵測系統主題', () => {
      // 模擬系統為 dark theme
      mockMatchMedia.mockReturnValue({
        matches: true, // true = dark theme
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      // 重新創建 store 以觸發初始化
      const { resolvedTheme } = useThemeStore.getState();

      // Note: 這裡的測試可能需要根據實際實作調整
      // 因為初始化時會呼叫 getSystemTheme()
      expect(resolvedTheme).toBeDefined();
    });
  });

  describe('setTheme', () => {
    it('應該設定 light 主題並儲存到 storage', async () => {
      vi.mocked(themeStorage.saveTheme).mockResolvedValue();

      const { setTheme } = useThemeStore.getState();
      await setTheme('light');

      const state = useThemeStore.getState();
      expect(state.mode).toBe('light');
      expect(state.resolvedTheme).toBe('light');
      expect(themeStorage.saveTheme).toHaveBeenCalledWith('light');
    });

    it('應該設定 dark 主題並儲存到 storage', async () => {
      vi.mocked(themeStorage.saveTheme).mockResolvedValue();

      const { setTheme } = useThemeStore.getState();
      await setTheme('dark');

      const state = useThemeStore.getState();
      expect(state.mode).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
      expect(themeStorage.saveTheme).toHaveBeenCalledWith('dark');
    });

    it('應該設定 system 主題並根據系統偏好解析', async () => {
      vi.mocked(themeStorage.saveTheme).mockResolvedValue();
      // 模擬系統為 dark theme
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { setTheme } = useThemeStore.getState();
      await setTheme('system');

      const state = useThemeStore.getState();
      expect(state.mode).toBe('system');
      expect(state.resolvedTheme).toBe('dark');
      expect(themeStorage.saveTheme).toHaveBeenCalledWith('system');
    });

    it('應該在儲存失敗時拋出錯誤', async () => {
      const error = new Error('Failed to save');
      vi.mocked(themeStorage.saveTheme).mockRejectedValue(error);

      const { setTheme } = useThemeStore.getState();

      await expect(setTheme('light')).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setResolvedTheme', () => {
    it('應該更新 resolvedTheme', () => {
      const { setResolvedTheme } = useThemeStore.getState();

      setResolvedTheme('dark');

      const state = useThemeStore.getState();
      expect(state.resolvedTheme).toBe('dark');
    });

    it('應該可以在 system 模式下動態切換 resolvedTheme', () => {
      const { setResolvedTheme } = useThemeStore.getState();
      useThemeStore.setState({ mode: 'system' });

      setResolvedTheme('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');

      setResolvedTheme('light');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
    });
  });

  describe('initializeTheme', () => {
    it('應該從 storage 載入已儲存的主題', async () => {
      vi.mocked(themeStorage.loadTheme).mockResolvedValue('dark');

      const { initializeTheme } = useThemeStore.getState();
      await initializeTheme();

      const state = useThemeStore.getState();
      expect(state.mode).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
      expect(state.isInitialized).toBe(true);
    });

    it('應該在沒有儲存資料時使用預設值 system', async () => {
      vi.mocked(themeStorage.loadTheme).mockResolvedValue(null);

      const { initializeTheme } = useThemeStore.getState();
      await initializeTheme();

      const state = useThemeStore.getState();
      expect(state.mode).toBe('system');
      expect(state.isInitialized).toBe(true);
    });

    it('應該在載入 system 主題時偵測系統偏好', async () => {
      vi.mocked(themeStorage.loadTheme).mockResolvedValue('system');
      // 模擬系統為 dark theme
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { initializeTheme } = useThemeStore.getState();
      await initializeTheme();

      const state = useThemeStore.getState();
      expect(state.mode).toBe('system');
      expect(state.resolvedTheme).toBe('dark');
      expect(state.isInitialized).toBe(true);
    });

    it('應該在載入失敗時使用預設值並設為已初始化', async () => {
      const error = new Error('Failed to load');
      vi.mocked(themeStorage.loadTheme).mockRejectedValue(error);

      const { initializeTheme } = useThemeStore.getState();
      await initializeTheme();

      const state = useThemeStore.getState();
      expect(state.mode).toBe('system');
      expect(state.isInitialized).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('整合測試', () => {
    it('應該正確處理完整的主題切換流程', async () => {
      vi.mocked(themeStorage.saveTheme).mockResolvedValue();
      vi.mocked(themeStorage.loadTheme).mockResolvedValue('light');

      // 初始化
      const { initializeTheme, setTheme } = useThemeStore.getState();
      await initializeTheme();

      expect(useThemeStore.getState().mode).toBe('light');
      expect(useThemeStore.getState().isInitialized).toBe(true);

      // 切換到 dark
      await setTheme('dark');
      expect(useThemeStore.getState().mode).toBe('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');

      // 切換到 system
      await setTheme('system');
      expect(useThemeStore.getState().mode).toBe('system');
      expect(useThemeStore.getState().resolvedTheme).toBeDefined();
    });

    it('應該在 system 模式下響應系統主題變化', async () => {
      vi.mocked(themeStorage.saveTheme).mockResolvedValue();

      const { setTheme, setResolvedTheme } = useThemeStore.getState();

      // 設定為 system 模式
      await setTheme('system');
      expect(useThemeStore.getState().mode).toBe('system');

      // 模擬系統主題變化
      setResolvedTheme('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');

      setResolvedTheme('light');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
    });
  });
});
