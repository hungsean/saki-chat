import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveAuthData,
  loadAuthData,
  clearAuthData,
  hasAuthData,
} from './authStorage';
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

describe('authStorage', () => {
  beforeEach(() => {
    // 重置 mock store 狀態
    resetMockTauriStore();
    vi.clearAllMocks();
  });

  describe('saveAuthData', () => {
    it('應該成功儲存認證資料', async () => {
      const authData = {
        userId: '@user:matrix.org',
        accessToken: 'test-token-123',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      };

      await saveAuthData(authData);

      // 驗證資料已儲存
      const mockStore = getMockTauriStore();
      const storedData = await mockStore.get('credentials');
      expect(storedData).toEqual(authData);
    });

    it('應該覆蓋現有的認證資料', async () => {
      const authData1 = {
        userId: '@user1:matrix.org',
        accessToken: 'token1',
        deviceId: 'device1',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix.org',
      };

      const authData2 = {
        userId: '@user2:example.com',
        accessToken: 'token2',
        deviceId: 'device2',
        homeServer: 'example.com',
        baseUrl: 'https://example.com',
      };

      // 第一次儲存
      await saveAuthData(authData1);

      // 第二次儲存(覆蓋)
      await saveAuthData(authData2);

      // 驗證最新的資料
      const mockStore = getMockTauriStore();
      const storedData = await mockStore.get('credentials');
      expect(storedData).toEqual(authData2);
    });
  });

  describe('loadAuthData', () => {
    it('應該成功載入儲存的認證資料', async () => {
      const authData = {
        userId: '@user:matrix.org',
        accessToken: 'test-token-123',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      };

      // 先儲存
      await saveAuthData(authData);

      // 再載入
      const loadedData = await loadAuthData();

      expect(loadedData).toEqual(authData);
    });

    it('應該在沒有資料時回傳 null', async () => {
      const loadedData = await loadAuthData();

      expect(loadedData).toBeNull();
    });

    it('應該在發生錯誤時回傳 null', async () => {
      const mockStore = getMockTauriStore();

      // Mock get 方法拋出錯誤
      vi.spyOn(mockStore, 'get').mockRejectedValueOnce(
        new Error('Store error')
      );

      const loadedData = await loadAuthData();

      expect(loadedData).toBeNull();
    });
  });

  describe('clearAuthData', () => {
    it('應該成功清除認證資料', async () => {
      const authData = {
        userId: '@user:matrix.org',
        accessToken: 'test-token-123',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      };

      // 先儲存
      await saveAuthData(authData);

      // 確認資料存在
      const mockStore = getMockTauriStore();
      expect(await mockStore.has('credentials')).toBe(true);

      // 清除
      await clearAuthData();

      // 驗證資料已被清除
      expect(await mockStore.has('credentials')).toBe(false);
    });

    it('應該可以重複呼叫 clearAuthData', async () => {
      await clearAuthData();
      await clearAuthData();

      const mockStore = getMockTauriStore();
      expect(await mockStore.has('credentials')).toBe(false);
    });
  });

  describe('hasAuthData', () => {
    it('應該在有資料時回傳 true', async () => {
      const authData = {
        userId: '@user:matrix.org',
        accessToken: 'test-token-123',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      };

      await saveAuthData(authData);

      const result = await hasAuthData();

      expect(result).toBe(true);
    });

    it('應該在沒有資料時回傳 false', async () => {
      const result = await hasAuthData();

      expect(result).toBe(false);
    });

    it('應該在發生錯誤時回傳 false', async () => {
      const mockStore = getMockTauriStore();

      // Mock has 方法拋出錯誤
      vi.spyOn(mockStore, 'has').mockRejectedValueOnce(
        new Error('Store error')
      );

      const result = await hasAuthData();

      expect(result).toBe(false);
    });
  });

  describe('整合測試', () => {
    it('應該正確處理完整的儲存載入清除流程', async () => {
      const authData = {
        userId: '@user:matrix.org',
        accessToken: 'test-token-123',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      };

      // 一開始沒有資料
      expect(await hasAuthData()).toBe(false);
      expect(await loadAuthData()).toBeNull();

      // 儲存資料
      await saveAuthData(authData);
      expect(await hasAuthData()).toBe(true);

      // 載入資料
      const loadedData = await loadAuthData();
      expect(loadedData).toEqual(authData);

      // 清除資料
      await clearAuthData();
      expect(await hasAuthData()).toBe(false);
      expect(await loadAuthData()).toBeNull();
    });

    it('應該正確處理多次更新的情況', async () => {
      const authData1 = {
        userId: '@user1:matrix.org',
        accessToken: 'token1',
        deviceId: 'device1',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix.org',
      };

      const authData2 = {
        userId: '@user2:example.com',
        accessToken: 'token2',
        deviceId: 'device2',
        homeServer: 'example.com',
        baseUrl: 'https://example.com',
      };

      // 第一次儲存
      await saveAuthData(authData1);
      expect(await loadAuthData()).toEqual(authData1);

      // 第二次儲存(更新)
      await saveAuthData(authData2);
      expect(await loadAuthData()).toEqual(authData2);

      // 清除
      await clearAuthData();
      expect(await loadAuthData()).toBeNull();
    });
  });
});
