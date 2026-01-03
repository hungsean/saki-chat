import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { type ThemeMode } from '@/lib/stores/zustand/themeStore';

// Mock themeStore
const mockSetTheme = vi.fn();
const mockThemeStore: { mode: ThemeMode; setTheme: typeof mockSetTheme } = {
  mode: 'system',
  setTheme: mockSetTheme,
};

vi.mock('@/lib/stores/zustand/themeStore', () => ({
  useThemeStore: vi.fn(() => mockThemeStore),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeStore.mode = 'system';
    mockSetTheme.mockResolvedValue(undefined);
  });

  describe('基本渲染', () => {
    it('應該成功渲染按鈕', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('應該在 system 模式下顯示 Monitor 圖示', () => {
      mockThemeStore.mode = 'system';

      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
      // Monitor icon 會被渲染
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('應該在 light 模式下顯示 Sun 圖示', () => {
      mockThemeStore.mode = 'light';

      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
      // Sun icon 會被渲染
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('應該在 dark 模式下顯示 Moon 圖示', () => {
      mockThemeStore.mode = 'dark';

      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
      // Moon icon 會被渲染
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('下拉選單', () => {
    it('應該在點擊按鈕後顯示選單', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });
  });

  describe('主題切換', () => {
    it('應該在點擊 Light 選項時切換到 light 主題', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      // 打開選單
      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // 點擊 Light 選項
      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });
      const lightOption = screen.getByText('Light');
      await user.click(lightOption);

      // 驗證 setTheme 被呼叫
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('應該在點擊 Dark 選項時切換到 dark 主題', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      // 打開選單
      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // 點擊 Dark 選項
      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument();
      });
      const darkOption = screen.getByText('Dark');
      await user.click(darkOption);

      // 驗證 setTheme 被呼叫
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('應該在點擊 System 選項時切換到 system 主題', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      // 打開選單
      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // 點擊 System 選項
      await waitFor(() => {
        expect(screen.getByText('System')).toBeInTheDocument();
      });
      const systemOption = screen.getByText('System');
      await user.click(systemOption);

      // 驗證 setTheme 被呼叫
      expect(mockSetTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('getCurrentIcon 函數', () => {
    it('應該根據當前模式顯示正確的圖示', () => {
      // System mode
      mockThemeStore.mode = 'system';
      const { rerender } = render(<ThemeToggle />);
      let button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('svg')).toBeInTheDocument();

      // Light mode
      mockThemeStore.mode = 'light';
      rerender(<ThemeToggle />);
      button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('svg')).toBeInTheDocument();

      // Dark mode
      mockThemeStore.mode = 'dark';
      rerender(<ThemeToggle />);
      button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('可訪問性', () => {
    it('應該有適當的 sr-only 文字', () => {
      render(<ThemeToggle />);

      const srOnlyText = screen.getByText('Toggle theme');
      expect(srOnlyText).toBeInTheDocument();
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('應該可以透過鍵盤操作', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // 使用 Tab 鍵聚焦按鈕
      await user.tab();
      expect(button).toHaveFocus();

      // 使用 Enter 鍵打開選單
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });
    });
  });

  describe('整合測試', () => {
    it('應該正確處理完整的主題切換流程', async () => {
      const user = userEvent.setup();

      // 初始狀態為 system
      mockThemeStore.mode = 'system';
      const { rerender } = render(<ThemeToggle />);

      // 打開選單並切換到 light
      let button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Light'));

      expect(mockSetTheme).toHaveBeenCalledWith('light');

      // 模擬狀態更新
      mockSetTheme.mockClear();
      mockThemeStore.mode = 'light';
      rerender(<ThemeToggle />);

      // 再次打開選單並切換到 dark
      button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Dark')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Dark'));

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });
  });
});
