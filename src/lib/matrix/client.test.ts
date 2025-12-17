import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as sdk from 'matrix-js-sdk';
import {
  loginToMatrix,
  createMatrixClient,
  logoutFromMatrix,
  type LoginCredentials,
} from './client';

// Mock matrix-js-sdk
vi.mock('matrix-js-sdk', () => ({
  createClient: vi.fn(),
}));

type MockMatrixClient = {
  login: ReturnType<typeof vi.fn>;
  startClient: ReturnType<typeof vi.fn>;
  stopClient: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
};

describe('Matrix Client', () => {
  let mockClient: MockMatrixClient;

  beforeEach(() => {
    // 建立 mock 客戶端
    mockClient = {
      login: vi.fn(),
      startClient: vi.fn(),
      stopClient: vi.fn(),
      logout: vi.fn(),
    };

    // Mock createClient 回傳 mock 客戶端
    vi.mocked(sdk.createClient).mockReturnValue(
      mockClient as unknown as sdk.MatrixClient
    );
  });

  describe('loginToMatrix', () => {
    const credentials: LoginCredentials = {
      baseUrl: 'https://matrix.org',
      username: 'testuser',
      password: 'testpass123',
    };

    it('應該成功登入並回傳使用者資訊', async () => {
      // Arrange
      const mockResponse = {
        access_token: 'test_token_123',
        user_id: '@testuser:matrix.org',
        device_id: 'DEVICE123',
        home_server: 'matrix.org',
      };
      mockClient.login.mockResolvedValue(mockResponse);

      // Act
      const result = await loginToMatrix(credentials);

      // Assert
      expect(sdk.createClient).toHaveBeenCalledWith({
        baseUrl: credentials.baseUrl,
      });
      expect(mockClient.login).toHaveBeenCalledWith('m.login.password', {
        user: credentials.username,
        password: credentials.password,
      });
      expect(result).toEqual({
        success: true,
        accessToken: mockResponse.access_token,
        userId: mockResponse.user_id,
        deviceId: mockResponse.device_id,
        homeServer: mockResponse.home_server,
      });
    });

    it('應該處理登入失敗並回傳錯誤訊息', async () => {
      // Arrange
      const errorMessage = 'Invalid username or password';
      mockClient.login.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await loginToMatrix(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(result.accessToken).toBeUndefined();
      expect(result.userId).toBeUndefined();
    });

    it('應該處理非 Error 類型的錯誤', async () => {
      // Arrange
      mockClient.login.mockRejectedValue('Unknown error');

      // Act
      const result = await loginToMatrix(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed. Please check your credentials.');
    });
  });

  describe('createMatrixClient', () => {
    it('應該建立並啟動 Matrix 客戶端', async () => {
      // Arrange
      const baseUrl = 'https://matrix.org';
      const accessToken = 'test_token_123';
      const userId = '@testuser:matrix.org';
      mockClient.startClient.mockResolvedValue(undefined);

      // Act
      const client = await createMatrixClient(baseUrl, accessToken, userId);

      // Assert
      expect(sdk.createClient).toHaveBeenCalledWith({
        baseUrl,
        accessToken,
        userId,
      });
      expect(mockClient.startClient).toHaveBeenCalledWith({
        initialSyncLimit: 10,
      });
      expect(client).toBe(mockClient);
    });

    it('應該在 startClient 失敗時停止客戶端並拋出錯誤', async () => {
      // Arrange
      const baseUrl = 'https://matrix.org';
      const accessToken = 'test_token_123';
      const userId = '@testuser:matrix.org';
      const errorMessage = 'Sync failed';
      mockClient.startClient.mockRejectedValue(new Error(errorMessage));
      mockClient.stopClient.mockReturnValue(undefined);

      // Act & Assert
      await expect(
        createMatrixClient(baseUrl, accessToken, userId)
      ).rejects.toThrow(errorMessage);

      // Verify that stopClient was called even though startClient failed
      expect(mockClient.stopClient).toHaveBeenCalled();
    });

    it('應該記錄錯誤當 startClient 失敗', async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const baseUrl = 'https://matrix.org';
      const accessToken = 'test_token_123';
      const userId = '@testuser:matrix.org';
      const testError = new Error('Network error during sync');
      mockClient.startClient.mockRejectedValue(testError);
      mockClient.stopClient.mockReturnValue(undefined);

      // Act & Assert
      await expect(
        createMatrixClient(baseUrl, accessToken, userId)
      ).rejects.toThrow('Network error during sync');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to start Matrix client:',
        testError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('logoutFromMatrix', () => {
    it('應該成功登出並停止客戶端', async () => {
      // Arrange
      mockClient.logout.mockResolvedValue(undefined);
      mockClient.stopClient.mockReturnValue(undefined);

      // Act
      await logoutFromMatrix(mockClient as unknown as sdk.MatrixClient);

      // Assert
      expect(mockClient.logout).toHaveBeenCalled();
      expect(mockClient.stopClient).toHaveBeenCalled();
    });

    it('應該在登出失敗時仍然停止客戶端', async () => {
      // Arrange
      const errorMessage = 'Logout failed';
      mockClient.logout.mockRejectedValue(new Error(errorMessage));
      mockClient.stopClient.mockReturnValue(undefined);

      // Act
      await logoutFromMatrix(mockClient as unknown as sdk.MatrixClient);

      // Assert
      expect(mockClient.logout).toHaveBeenCalled();
      expect(mockClient.stopClient).toHaveBeenCalled();
    });
  });
});
