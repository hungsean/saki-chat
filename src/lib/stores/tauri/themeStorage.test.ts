import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTheme, loadTheme, clearTheme, hasTheme } from './themeStorage';
import { resetMockTauriStore, getMockTauriStore } from '@/test/mocks/tauri';

// Mock Tauri Store
vi.mock('@tauri-apps/plugin-store', async () => {
  const { mockTauriStore } = await import('@/test/mocks/tauri');
  return {
    Store: {
      load: mockTauriStore.load,
    },
  };
});

describe('themeStorage', () => {
  beforeEach(() => {
    // 重置 mock store 狀態
    resetMockTauriStore();
    vi.clearAllMocks();
  });

  describe('saveTheme', () => {
    it('應該成功儲存 system 主題設定', async () => {
      await saveTheme('system');

      // 驗證資料已儲存
      const mockStore = getMockTauriStore();
      const storedData = await mockStore.get('theme');
      expect(storedData).toEqual({ theme: 'system' });
    });

    it('應該成功儲存 light 主題設定', async () => {
      await saveTheme('light');

      const mockStore = getMockTauriStore();
      const storedData = await mockStore.get('theme');
      expect(storedData).toEqual({ theme: 'light' });
    });

    it('應該成功儲存 dark 主題設定', async () => {
      await saveTheme('dark');

      const mockStore = getMockTauriStore();
      const storedData = await mockStore.get('theme');
      expect(storedData).toEqual({ theme: 'dark' });
    });

    it('應該覆蓋現有的主題設定', async () => {
      // 第一次儲存
      await saveTheme('light');

      // 第二次儲存(覆蓋)
      await saveTheme('dark');

      // 驗證最新的資料
      const mockStore = getMockTauriStore();
      const storedData = await mockStore.get('theme');
      expect(storedData).toEqual({ theme: 'dark' });
    });

    it('應該在發生錯誤時拋出錯誤', async () => {
      const mockStore = getMockTauriStore();
      // Mock set 方法拋出錯誤
      const originalSet = mockStore.set;
      mockStore.set = vi.fn().mockRejectedValue(new Error('Store error'));

      await expect(saveTheme('light')).rejects.toThrow(
        'Failed to save theme: Store error'
      );

      // 恢復原始方法
      mockStore.set = originalSet;
    });
  });

  describe('loadTheme', () => {
    it('應該成功載入儲存的主題設定', async () => {
      // 先儲存
      await saveTheme('dark');

      // 再載入
      const loadedTheme = await loadTheme();

      expect(loadedTheme).toBe('dark');
    });

    it('應該在沒有資料時回傳 null', async () => {
      const loadedTheme = await loadTheme();

      expect(loadedTheme).toBeNull();
    });

    it('應該在發生錯誤時回傳 null', async () => {
      const mockStore = getMockTauriStore();
      // Mock get 方法拋出錯誤
      const originalGet = mockStore.get;
      mockStore.get = vi.fn().mockRejectedValue(new Error('Store error'));

      const loadedTheme = await loadTheme();

      expect(loadedTheme).toBeNull();

      // 恢復原始方法
      mockStore.get = originalGet;
    });

    it('應該在資料格式不正確時回傳 null', async () => {
      const mockStore = getMockTauriStore();
      // 儲存不正確格式的資料
      await mockStore.set('theme', { wrongKey: 'value' });

      const loadedTheme = await loadTheme();

      expect(loadedTheme).toBeNull();
    });
  });

  describe('clearTheme', () => {
    it('應該成功清除主題設定', async () => {
      // 先儲存
      await saveTheme('dark');

      // 確認已儲存
      const mockStore = getMockTauriStore();
      let storedData = await mockStore.get('theme');
      expect(storedData).toEqual({ theme: 'dark' });

      // 清除
      await clearTheme();

      // 確認已清除
      storedData = await mockStore.get('theme');
      expect(storedData).toBeNull();
    });

    it('應該可以重複呼叫 clearTheme', async () => {
      // 第一次清除
      await clearTheme();

      // 第二次清除(不應該出錯)
      await expect(clearTheme()).resolves.not.toThrow();
    });

    it('應該在發生錯誤時拋出錯誤', async () => {
      const mockStore = getMockTauriStore();
      // Mock delete 方法拋出錯誤
      const originalDelete = mockStore.delete;
      mockStore.delete = vi.fn().mockRejectedValue(new Error('Store error'));

      await expect(clearTheme()).rejects.toThrow(
        'Failed to clear theme: Store error'
      );

      // 恢復原始方法
      mockStore.delete = originalDelete;
    });
  });

  describe('hasTheme', () => {
    it('應該在有資料時回傳 true', async () => {
      await saveTheme('dark');

      const result = await hasTheme();

      expect(result).toBe(true);
    });

    it('應該在沒有資料時回傳 false', async () => {
      const result = await hasTheme();

      expect(result).toBe(false);
    });

    it('應該在發生錯誤時回傳 false', async () => {
      const mockStore = getMockTauriStore();
      // Mock has 方法拋出錯誤
      const originalHas = mockStore.has;
      mockStore.has = vi.fn().mockRejectedValue(new Error('Store error'));

      const result = await hasTheme();

      expect(result).toBe(false);

      // 恢復原始方法
      mockStore.has = originalHas;
    });
  });

  describe('整合測試', () => {
    it('應該正確處理完整的儲存載入清除流程', async () => {
      // 初始狀態：沒有資料
      expect(await loadTheme()).toBeNull();
      expect(await hasTheme()).toBe(false);

      // 儲存主題
      await saveTheme('dark');

      // 驗證已儲存
      expect(await loadTheme()).toBe('dark');
      expect(await hasTheme()).toBe(true);

      // 清除主題
      await clearTheme();

      // 驗證已清除
      expect(await loadTheme()).toBeNull();
      expect(await hasTheme()).toBe(false);
    });

    it('應該正確處理多次更新的情況', async () => {
      // 儲存 system
      await saveTheme('system');
      expect(await loadTheme()).toBe('system');

      // 更新為 light
      await saveTheme('light');
      expect(await loadTheme()).toBe('light');

      // 更新為 dark
      await saveTheme('dark');
      expect(await loadTheme()).toBe('dark');

      // 清除
      await clearTheme();
      expect(await loadTheme()).toBeNull();
    });
  });
});
