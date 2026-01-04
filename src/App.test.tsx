import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as authStorage from '@/lib/stores/tauri/authStorage';

// Mock HomeserverForm, CredentialsForm 和 LoginSuccess 元件
vi.mock('@/features/auth/HomeserverForm', () => ({
  HomeserverForm: () => (
    <div data-testid="homeserver-form">Homeserver Form</div>
  ),
}));

vi.mock('@/features/auth/CredentialsForm', () => ({
  CredentialsForm: () => (
    <div data-testid="credentials-form">Credentials Form</div>
  ),
}));

vi.mock('@/features/auth/LoginSuccess', () => ({
  LoginSuccess: () => <div data-testid="login-success">Login Success</div>,
}));

// Mock authStorage
vi.mock('@/lib/stores/tauri/authStorage', () => ({
  loadAuthData: vi.fn(),
}));

// Mock authStore
const mockSetAuthData = vi.fn();
const mockAuthStore = {
  isAuthenticated: false,
  setAuthData: mockSetAuthData,
};

vi.mock('@/lib/stores/zustand/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockAuthStore);
    }
    return mockAuthStore;
  }),
}));

// Test helpers
const pendingPromise = (): Promise<never> => new Promise(() => {}); // 永不 resolve,保持載入狀態
const noop = () => {};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStore.isAuthenticated = false;
  });

  describe('初始化載入', () => {
    it('應該在初始化時顯示載入畫面', () => {
      // Arrange
      vi.mocked(authStorage.loadAuthData).mockImplementation(pendingPromise);

      // Act
      render(<App />);

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    it('應該載入儲存的認證資料並恢復狀態', async () => {
      // Arrange
      const storedAuth = {
        accessToken: 'stored_token',
        userId: '@user:matrix.org',
        deviceId: 'DEVICE123',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix.org',
      };
      vi.mocked(authStorage.loadAuthData).mockResolvedValue(storedAuth);

      // Act
      render(<App />);

      // Assert
      await waitFor(() => {
        expect(authStorage.loadAuthData).toHaveBeenCalled();
        expect(mockSetAuthData).toHaveBeenCalledWith(storedAuth);
      });
    });

    it('應該在沒有儲存的認證資料時正常完成初始化', async () => {
      // Arrange
      vi.mocked(authStorage.loadAuthData).mockResolvedValue(null);

      // Act
      render(<App />);

      // Assert
      await waitFor(() => {
        expect(authStorage.loadAuthData).toHaveBeenCalled();
        expect(mockSetAuthData).not.toHaveBeenCalled();
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('應該處理載入認證資料失敗的情況', async () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(noop);
      const error = new Error('Failed to load auth data');
      vi.mocked(authStorage.loadAuthData).mockRejectedValue(error);

      // Act
      render(<App />);

      // Assert
      await waitFor(() => {
        expect(authStorage.loadAuthData).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to load stored auth:',
          error
        );
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('路由行為', () => {
    beforeEach(() => {
      vi.mocked(authStorage.loadAuthData).mockResolvedValue(null);
    });

    it('應該在未認證時顯示登入表單', async () => {
      // Arrange
      mockAuthStore.isAuthenticated = false;

      // Act
      render(<App />);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('homeserver-form')).toBeInTheDocument();
    });

    it('應該在已認證時從登入頁重定向到成功頁', async () => {
      // Arrange
      mockAuthStore.isAuthenticated = true;

      // Act
      render(<App />);

      // Assert - 等待載入完成且重定向到成功頁
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        expect(screen.getByTestId('login-success')).toBeInTheDocument();
      });
    });
  });
});
