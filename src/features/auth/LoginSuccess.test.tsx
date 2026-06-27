import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { LoginSuccess } from './LoginSuccess';
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

// Mock auth storage
vi.mock('@/lib/stores/tauri/authStorage');
const mockClearAuthData = vi.mocked(authStorage.clearAuthData);

// Mock auth store
const mockClearAuth = vi.fn();
let mockAuthStoreState = {
  userId: '@testuser:matrix.org',
  homeServer: 'matrix.org',
  clearAuth: mockClearAuth,
};

vi.mock('@/lib/stores/zustand/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockAuthStoreState);
    }
    return mockAuthStoreState;
  }),
}));

// Mock sanitize utilities
vi.mock('@/lib/utils/sanitize', () => ({
  sanitizeText: vi.fn((text) => text),
  isValidMatrixUserId: vi.fn((userId) =>
    /^@[a-z0-9._=\-/]+:[a-z0-9.-]+\.[a-z]{2,}$/i.test(userId)
  ),
  isValidHomeserverDomain: vi.fn((domain) =>
    /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)
  ),
}));

describe('LoginSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStoreState = {
      userId: '@testuser:matrix.org',
      homeServer: 'matrix.org',
      clearAuth: mockClearAuth,
    };
    // Reset console.warn spy
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('顯示用戶資訊', () => {
    it('應該顯示成功訊息', () => {
      render(<LoginSuccess />);

      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(
        screen.getByText('You have successfully logged in')
      ).toBeInTheDocument();
    });

    it('應該顯示用戶 ID', () => {
      render(<LoginSuccess />);

      expect(screen.getByText('User ID:')).toBeInTheDocument();
      expect(screen.getByText('@testuser:matrix.org')).toBeInTheDocument();
    });

    it('應該顯示 homeserver', () => {
      render(<LoginSuccess />);

      expect(screen.getByText('Home Server:')).toBeInTheDocument();
      expect(screen.getByText('matrix.org')).toBeInTheDocument();
    });

    it('應該顯示 "Continue to Chat" 按鈕 (disabled)', () => {
      render(<LoginSuccess />);

      const continueButton = screen.getByRole('button', {
        name: /Continue to Chat/i,
      });
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toBeDisabled();
      expect(screen.getByText('🚧 Coming soon...')).toBeInTheDocument();
    });

    it('應該顯示 Logout 按鈕', () => {
      render(<LoginSuccess />);

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).not.toBeDisabled();
    });
  });

  describe('XSS 防護', () => {
    it('應該對 userId 進行 sanitize', async () => {
      const { sanitizeText } = await import('@/lib/utils/sanitize');
      render(<LoginSuccess />);

      expect(sanitizeText).toHaveBeenCalledWith('@testuser:matrix.org');
    });

    it('應該對 homeServer 進行 sanitize', async () => {
      const { sanitizeText } = await import('@/lib/utils/sanitize');
      render(<LoginSuccess />);

      expect(sanitizeText).toHaveBeenCalledWith('matrix.org');
    });

    it('應該處理空值', () => {
      mockAuthStoreState = {
        userId: '',
        homeServer: '',
        clearAuth: mockClearAuth,
      };

      render(<LoginSuccess />);

      // 不應該拋出錯誤，應該顯示空字串
      expect(screen.getByText('User ID:')).toBeInTheDocument();
      expect(screen.getByText('Home Server:')).toBeInTheDocument();
    });
  });

  describe('格式驗證', () => {
    it('應該對有效的 userId 格式不顯示警告', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      render(<LoginSuccess />);

      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Invalid Matrix User ID format')
      );
    });

    it('應該對無效的 userId 格式顯示警告', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const { isValidMatrixUserId } = await import('@/lib/utils/sanitize');
      vi.mocked(isValidMatrixUserId).mockReturnValue(false);

      mockAuthStoreState = {
        userId: 'invalid-user-id',
        homeServer: 'matrix.org',
        clearAuth: mockClearAuth,
      };

      render(<LoginSuccess />);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[LoginSuccess] Invalid Matrix User ID format:',
        'invalid-user-id'
      );
    });

    it('應該對有效的 homeServer 格式不顯示警告', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      render(<LoginSuccess />);

      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Invalid homeserver domain format')
      );
    });

    it('應該對無效的 homeServer 格式顯示警告', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const { isValidHomeserverDomain } = await import('@/lib/utils/sanitize');
      vi.mocked(isValidHomeserverDomain).mockReturnValue(false);

      mockAuthStoreState = {
        userId: '@testuser:matrix.org',
        homeServer: 'invalid domain!',
        clearAuth: mockClearAuth,
      };

      render(<LoginSuccess />);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[LoginSuccess] Invalid homeserver domain format:',
        'invalid domain!'
      );
    });
  });

  describe('Logout 功能', () => {
    it('應該在點擊 Logout 時清除認證資料並導航 (Tauri 可用)', async () => {
      const user = userEvent.setup();
      mockClearAuthData.mockResolvedValue();

      render(<LoginSuccess />);

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockClearAuthData).toHaveBeenCalled();
        expect(mockClearAuth).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('應該在非 Tauri 環境 (clearAuthData 優雅降級) 仍清空狀態並導向 /login', async () => {
      // 非 Tauri 環境下 clearAuthData 會優雅 resolve (不丟出 undefined is not an object),
      // 因此後續的 clearAuth 與導頁不應被擋掉
      const user = userEvent.setup();
      mockClearAuthData.mockResolvedValue();

      render(<LoginSuccess />);

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockClearAuth).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('應該在 Tauri Store 清除失敗時記錄錯誤', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const testError = new Error('Failed to clear store');
      mockClearAuthData.mockRejectedValue(testError);

      render(<LoginSuccess />);

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Logout failed:',
          testError
        );
      });

      // 即使 Tauri Store 清除失敗，也不應該阻止 logout
      // (因為 catch 區塊只記錄錯誤，不重新拋出)
      expect(mockClearAuthData).toHaveBeenCalled();
    });

    it('應該在 logout 失敗後仍然保持在當前頁面', async () => {
      const user = userEvent.setup();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClearAuthData.mockRejectedValue(new Error('Network error'));

      render(<LoginSuccess />);

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockClearAuthData).toHaveBeenCalled();
      });

      // 錯誤發生時不應該導航
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
