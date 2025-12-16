import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import * as homeserverUtils from '@/lib/matrix/homeserver';
import * as matrixClient from '@/lib/matrix/client';
import * as authStorage from '@/lib/stores/tauri/authStorage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock homeserver utilities
vi.mock('@/lib/matrix/homeserver');
const mockVerifyHomeserver = vi.mocked(homeserverUtils.verifyHomeserver);
const mockExtractHomeserverDomain = vi.mocked(
  homeserverUtils.extractHomeserverDomain
);

// Mock matrix client
vi.mock('@/lib/matrix/client');
const mockLoginToMatrix = vi.mocked(matrixClient.loginToMatrix);

// Mock auth storage
vi.mock('@/lib/stores/tauri/authStorage');
const mockSaveAuthData = vi.mocked(authStorage.saveAuthData);

// Mock auth store
const mockSetAuthData = vi.fn();
vi.mock('@/lib/stores/zustand/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const store = {
      setAuthData: mockSetAuthData,
    };
    return selector ? selector(store) : store;
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractHomeserverDomain.mockImplementation((url) =>
      url.replace(/^https?:\/\//, '')
    );
  });

  describe('第一步: Homeserver 驗證', () => {
    it('應該顯示初始的 homeserver 輸入表單', () => {
      render(<LoginForm />);

      expect(screen.getByText('Saki Chat')).toBeInTheDocument();
      expect(
        screen.getByText('Sign in to your Matrix account')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Homeserver')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });

    it('應該能夠輸入 homeserver', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const homeserverInput = screen.getByLabelText('Homeserver');

      await user.clear(homeserverInput);
      await user.type(homeserverInput, 'example.com');

      expect(homeserverInput).toHaveValue('example.com');
    });

    it('應該在驗證成功後進入第二步', async () => {
      const user = userEvent.setup();
      mockVerifyHomeserver.mockResolvedValue({
        isValid: true,
        baseUrl: 'https://matrix-client.matrix.org',
        normalizedUrl: 'https://matrix.org',
      });

      render(<LoginForm />);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockVerifyHomeserver).toHaveBeenCalledWith('matrix.org');
      });

      // 應該顯示第二步的輸入欄位
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Login' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });

    it('應該在驗證失敗時顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      mockVerifyHomeserver.mockResolvedValue({
        isValid: false,
        normalizedUrl: 'https://invalid.com',
        error: 'Cannot connect to homeserver',
      });

      render(<LoginForm />);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(
          screen.getByText('Cannot connect to homeserver')
        ).toBeInTheDocument();
      });

      // 應該還在第一步
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });

    it('應該在驗證時顯示 loading 狀態', async () => {
      const user = userEvent.setup();
      mockVerifyHomeserver.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  isValid: true,
                  baseUrl: 'https://matrix.org',
                  normalizedUrl: 'https://matrix.org',
                }),
              100
            );
          })
      );

      render(<LoginForm />);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      // 應該顯示 Verifying...
      expect(
        screen.getByRole('button', { name: 'Verifying...' })
      ).toBeDisabled();
    });
  });

  describe('第二步: 登入', () => {
    beforeEach(async () => {
      mockVerifyHomeserver.mockResolvedValue({
        isValid: true,
        baseUrl: 'https://matrix-client.matrix.org',
        normalizedUrl: 'https://matrix.org',
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      // 先完成第一步
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
      });
    });

    it('應該能夠輸入帳號密碼', async () => {
      const user = userEvent.setup();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('password123');
    });

    it('應該在登入成功後儲存資料並導航', async () => {
      const user = userEvent.setup();
      mockLoginToMatrix.mockResolvedValue({
        success: true,
        accessToken: 'test-token',
        userId: '@testuser:matrix.org',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
      });
      mockSaveAuthData.mockResolvedValue();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginToMatrix).toHaveBeenCalledWith({
          baseUrl: 'https://matrix-client.matrix.org',
          username: '@testuser:matrix.org',
          password: 'password123',
        });
      });

      // 應該儲存認證資料
      expect(mockSetAuthData).toHaveBeenCalledWith({
        userId: '@testuser:matrix.org',
        accessToken: 'test-token',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      });

      expect(mockSaveAuthData).toHaveBeenCalledWith({
        userId: '@testuser:matrix.org',
        accessToken: 'test-token',
        deviceId: 'DEVICEID',
        homeServer: 'matrix.org',
        baseUrl: 'https://matrix-client.matrix.org',
      });

      // 應該導航到 success 頁面
      expect(mockNavigate).toHaveBeenCalledWith('/success');
    });

    it('應該在登入失敗時顯示錯誤訊息', async () => {
      const user = userEvent.setup();
      mockLoginToMatrix.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // 不應該導航
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('應該在登入時顯示 loading 狀態', async () => {
      const user = userEvent.setup();
      mockLoginToMatrix.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                  accessToken: 'token',
                  userId: '@user:matrix.org',
                  deviceId: 'device',
                  homeServer: 'matrix.org',
                }),
              100
            );
          })
      );

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const loginButton = screen.getByRole('button', { name: 'Login' });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // 應該顯示 Logging in...
      expect(
        screen.getByRole('button', { name: 'Logging in...' })
      ).toBeDisabled();
    });

    it('應該能夠點擊 Back 回到第一步', async () => {
      const user = userEvent.setup();

      const backButton = screen.getByRole('button', { name: 'Back' });
      await user.click(backButton);

      // 應該回到第一步
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Login' })
      ).not.toBeInTheDocument();
    });

    it('應該在點擊 Back 時清除帳號密碼和錯誤', async () => {
      const user = userEvent.setup();

      // 先輸入一些資料並觸發錯誤
      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');

      mockLoginToMatrix.mockResolvedValue({
        success: false,
        error: 'Test error',
      });

      const loginButton = screen.getByRole('button', { name: 'Login' });
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      // 點擊 Back
      const backButton = screen.getByRole('button', { name: 'Back' });
      await user.click(backButton);

      // 再次進入第二步
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
      });

      // 帳號密碼應該被清除
      expect(screen.getByLabelText('Username')).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');

      // 錯誤訊息應該被清除
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });
});
