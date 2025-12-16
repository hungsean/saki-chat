import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    // 重置 store 到初始狀態
    useAuthStore.setState({
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      accessToken: null,
      deviceId: null,
      homeServer: null,
      baseUrl: null,
      client: null,
    });
  });

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      const state = useAuthStore.getState();

      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.userId).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.deviceId).toBeNull();
      expect(state.homeServer).toBeNull();
      expect(state.baseUrl).toBeNull();
      expect(state.client).toBeNull();
    });
  });

  describe('setAuthData', () => {
    it('應該設定認證資料並將 isAuthenticated 設為 true', () => {
      const { setAuthData } = useAuthStore.getState();
      const authData = {
        userId: '@user:matrix.org',
        accessToken: 'test-token-123',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      };

      setAuthData(authData);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.userId).toBe(authData.userId);
      expect(state.accessToken).toBe(authData.accessToken);
      expect(state.deviceId).toBe(authData.deviceId);
      expect(state.homeServer).toBe(authData.homeServer);
      expect(state.baseUrl).toBe(authData.baseUrl);
    });

    it('應該更新現有的認證資料', () => {
      const { setAuthData } = useAuthStore.getState();

      // 第一次設定
      setAuthData({
        userId: '@user1:matrix.org',
        accessToken: 'token1',
        deviceId: 'device1',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix.org',
      });

      // 第二次設定(更新)
      setAuthData({
        userId: '@user2:example.com',
        accessToken: 'token2',
        deviceId: 'device2',
        homeServer: 'example.com',
        baseUrl: 'https://example.com',
      });

      const state = useAuthStore.getState();
      expect(state.userId).toBe('@user2:example.com');
      expect(state.accessToken).toBe('token2');
      expect(state.deviceId).toBe('device2');
      expect(state.homeServer).toBe('example.com');
      expect(state.baseUrl).toBe('https://example.com');
    });
  });

  describe('setClient', () => {
    it('應該設定 Matrix client', () => {
      const { setClient } = useAuthStore.getState();
      const mockClient = { test: 'mock-client' } as any;

      setClient(mockClient);

      const state = useAuthStore.getState();
      expect(state.client).toBe(mockClient);
    });

    it('應該可以更新現有的 client', () => {
      const { setClient } = useAuthStore.getState();
      const mockClient1 = { id: 1 } as any;
      const mockClient2 = { id: 2 } as any;

      setClient(mockClient1);
      expect(useAuthStore.getState().client).toBe(mockClient1);

      setClient(mockClient2);
      expect(useAuthStore.getState().client).toBe(mockClient2);
    });
  });

  describe('setLoading', () => {
    it('應該設定 loading 為 true', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(true);

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('應該設定 loading 為 false', () => {
      const { setLoading } = useAuthStore.getState();

      // 先設為 true
      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      // 再設為 false
      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('應該清除所有認證資料', () => {
      const { setAuthData, setClient, clearAuth } = useAuthStore.getState();

      // 先設定一些資料
      setAuthData({
        userId: '@user:matrix.org',
        accessToken: 'token',
        deviceId: 'device',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix.org',
      });
      setClient({ test: 'client' } as any);

      // 確認資料已設定
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().userId).not.toBeNull();
      expect(useAuthStore.getState().client).not.toBeNull();

      // 清除
      clearAuth();

      // 驗證所有資料都被清除
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userId).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.deviceId).toBeNull();
      expect(state.homeServer).toBeNull();
      expect(state.baseUrl).toBeNull();
      expect(state.client).toBeNull();
    });

    it('應該可以重複呼叫 clearAuth', () => {
      const { clearAuth } = useAuthStore.getState();

      clearAuth();
      const state1 = useAuthStore.getState();

      clearAuth();
      const state2 = useAuthStore.getState();

      // 兩次呼叫的結果應該一樣
      expect(state1).toEqual(state2);
      expect(state2.isAuthenticated).toBe(false);
    });
  });

  describe('整合測試', () => {
    it('應該正確處理完整的登入登出流程', () => {
      const { setAuthData, setClient, setLoading, clearAuth } =
        useAuthStore.getState();

      // 開始登入
      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      // 設定認證資料
      setAuthData({
        userId: '@user:matrix.org',
        accessToken: 'token',
        deviceId: 'device',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix.org',
      });

      // 設定 client
      setClient({ test: 'client' } as any);

      // 完成登入
      setLoading(false);

      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.userId).toBe('@user:matrix.org');
      expect(state.client).not.toBeNull();

      // 登出
      clearAuth();

      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.userId).toBeNull();
      expect(state.client).toBeNull();
    });
  });
});
